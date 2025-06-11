import React from 'react';

interface GridProps {
  children: React.ReactNode;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | { x?: number; y?: number };
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 4,
  className = '',
}) => {
  // Handle responsive columns
  let colsClasses = '';
  if (typeof cols === 'number') {
    colsClasses = `grid-cols-${cols}`;
  } else {
    const { sm, md, lg, xl } = cols;
    colsClasses = [
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`,
    ].filter(Boolean).join(' ');
  }
  
  // Handle gap
  let gapClasses = '';
  if (typeof gap === 'number') {
    gapClasses = `gap-${gap}`;
  } else {
    const { x, y } = gap;
    gapClasses = [
      x && `gap-x-${x}`,
      y && `gap-y-${y}`,
    ].filter(Boolean).join(' ');
  }
  
  return (
    <div className={`grid ${colsClasses} ${gapClasses} ${className}`}>
      {children}
    </div>
  );
};