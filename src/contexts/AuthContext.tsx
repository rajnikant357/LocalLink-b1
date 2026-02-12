import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "customer" | "provider" | "admin";
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (name: string, phone: string, email: string, password: string, type: "customer" | "provider") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = "ll_local_users";
const LOCAL_SESSION_KEY = "ll_local_session";

const readStoredUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem(LOCAL_SESSION_KEY);
    if (sessionId) {
      const users = readStoredUsers();
      const found = users.find((u) => u.id === sessionId);
      if (found) {
        const { password, ...rest } = found;
        setUser(rest);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      let users = readStoredUsers();
      let found = users.find((u) => u.email === email);
      if (!found) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const name = email.split("@")[0] || "user";
        const newUser: StoredUser = { id, name, email, type: "customer", password } as StoredUser;
        users.push(newUser);
        writeStoredUsers(users);
        found = newUser;
      }
      // For prototype: accept any password / credentials — sign in the found/created user
      localStorage.setItem(LOCAL_SESSION_KEY, found.id);
      const { password: _p, ...publicUser } = found;
      setUser(publicUser);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (name: string, phone: string, email: string, password: string, type: "customer" | "provider") => {
    try {
      const users = readStoredUsers();
      let existing = users.find((u) => u.email === email);
      if (!existing) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newUser: StoredUser = { id, name, email, type, password } as StoredUser;
        users.push(newUser);
        writeStoredUsers(users);
        localStorage.setItem(LOCAL_SESSION_KEY, id);
        const { password: _p, ...publicUser } = newUser;
        setUser(publicUser);
      } else {
        // If user exists, sign them in regardless of password for prototype convenience
        localStorage.setItem(LOCAL_SESSION_KEY, existing.id);
        const { password: _p, ...publicUser } = existing;
        setUser(publicUser);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
