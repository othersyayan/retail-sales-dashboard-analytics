import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '1.5rem', style }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
};
