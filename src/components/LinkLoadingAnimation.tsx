import React from "react";

const LinkLoadingAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-56 h-56 flex items-center justify-center">
                <img
                    src="/Link.gif"
                    alt="Loading"
                    className="w-52 h-52 object-contain"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
};

export default LinkLoadingAnimation;
