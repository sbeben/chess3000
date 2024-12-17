import React from "react";

import classNames from "classnames";

type ButtonVariant = "default" | "accent" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyles =
  "w-full rounded p-1 md:p-2 lg:p-4 text-white lg:text-lg disabled:pointer-events-none disabled:cursor-not-allowed";

const variantStyles = {
  default: "bg-blue hover:bg-blue-600 active:bg-blue-600 disabled:bg-blue-800",
  accent: "bg-green_yellow hover:bg-green_yellow-600 active:bg-green_yellow-600 disabled:bg-green_yellow-800",
  secondary: "bg-gray hover:bg-gray-600 active:bg-gray-600 disabled:bg-gray-800",
  danger: "bg-red hover:bg-red-600 active:bg-red-600 disabled:bg-red-800",
};

const Button: React.FC<ButtonProps> = ({ variant = "default", className, ...props }) => {
  const buttonClasses = classNames(baseStyles, variantStyles[variant], className);

  return <button className={buttonClasses} {...props} />;
};

export { Button };
