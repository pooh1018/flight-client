import React from 'react';
import PropTypes from 'prop-types';

const SkeletonTitle = ({
  width = '38%',
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-skeleton-title';
  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  // 合并样式
  const mergedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    ...style
  };

  return (
    <div className={classes} style={mergedStyle} {...props} />
  );
};

SkeletonTitle.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  style: PropTypes.object
};

export default SkeletonTitle;
