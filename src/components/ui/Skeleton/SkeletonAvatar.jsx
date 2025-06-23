import React from 'react';
import PropTypes from 'prop-types';

const SkeletonAvatar = ({
  size = 'default',
  shape = 'circle',
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-skeleton-avatar';
  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    `${baseClass}--${shape}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} {...props} />
  );
};

SkeletonAvatar.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  shape: PropTypes.oneOf(['circle', 'square']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default SkeletonAvatar;
