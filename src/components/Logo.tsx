import React from 'react';

export const Logo = () => {
    return (
        <div className="flex items-center gap-2 font-montserrat tracking-tight cursor-pointer hover:opacity-90 transition-opacity">
            <span className="text-brand-blue font-extrabold text-xl sm:text-2xl leading-none">
                CIDADE VIVA
            </span>
            <span className="text-brand-orange font-medium text-xl sm:text-2xl leading-none tracking-tighter">
                Education
            </span>
        </div>
    );
};
