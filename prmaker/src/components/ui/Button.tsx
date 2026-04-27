import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        ghost: "bg-transparent hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };
    const sizes = {
        sm: "h-8 px-3 text-sm min-h-[44px] md:min-h-0", // 모바일 최소 클릭 영역 44px 적용
        md: "h-10 px-4 py-2 min-h-[44px] md:min-h-0",
        lg: "h-12 px-6 text-lg min-h-[44px]"
    };

    const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};
