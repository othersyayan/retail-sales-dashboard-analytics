import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...props }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};
