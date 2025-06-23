import React from 'react';
import PropTypes from 'prop-types';

const SkeletonButton = ({
  size = 'default',
  shape = 'default',
  block = false,
  active = false,
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-skeleton-button';
  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    shape !== 'default' ? `${baseClass}--${shape}` : '',
    block ? `${baseClass}--block` : '',
    active ? `${baseClass}--active` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} {...props} />
  );
};

SkeletonButton.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  shape: PropTypes.oneOf(['default', 'circle', 'round']),
  block: PropTypes.bool,
  active: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default SkeletonButton;
