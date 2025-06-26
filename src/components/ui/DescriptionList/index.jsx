import React from 'react';
import './index.scss';

export const DescriptionItem = ({ label, children, span = 1 }) => {
  return (
    <div className={`description-item span-${span}`}>
      <div className="description-item-label">{label}</div>
      <div className="description-item-content">{children}</div>
    </div>
  );
};

const DescriptionList = ({ children, bordered = false, column = { xs: 1, sm: 2, md: 3 } }) => {
  const getColumnCount = () => {
    const width = window.innerWidth;
    if (width < 576 && column.xs) return column.xs;
    if (width < 768 && column.sm) return column.sm;
    return column.md || 3;
  };

  const columnCount = getColumnCount();

  return (
    <div className={`description-list ${bordered ? 'bordered' : ''}`} style={{ '--column-count': columnCount }}>
      {children}
    </div>
  );
};

export default DescriptionList;
