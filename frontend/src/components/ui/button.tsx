import React from "react";

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white ${className}`}
  />
);
