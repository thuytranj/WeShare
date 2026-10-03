import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`neu-card rounded-3xl p-6 sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
