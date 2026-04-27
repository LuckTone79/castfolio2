import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'gray' | 'yellow' | 'green' | 'blue' | 'red';
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'gray',
    className = '',
    children,
    ...props
}) => {
    const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
    const variants = {
        gray: "bg-gray-100 text-gray-800",       // Draft
        yellow: "bg-yellow-100 text-yellow-800",   // Preview
        green: "bg-green-100 text-green-800",      // Published
        blue: "bg-blue-100 text-blue-800",         // Paid
        red: "bg-red-100 text-red-800"             // Refunded
    };

    const classes = `${baseStyle} ${variants[variant]} ${className}`;

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};
