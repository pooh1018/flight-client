import React from 'react';
import PropTypes from 'prop-types';

const CarouselItem = ({
  children,
  isActive = false,
  effect = 'slide',
  easing = 'ease',
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-carousel-item';
  const classes = [
    baseClass,
    isActive ? `${baseClass}--active` : '',
    `${baseClass}--${effect}`,
    className
  ].filter(Boolean).join(' ');

  // 根据效果类型计算样式
  const getItemStyle = () => {
    const baseStyle = {
      ...style,
      transition: `transform 300ms ${easing}, opacity 300ms ${easing}`
    };

    if (effect === 'slide') {
      return {
        ...baseStyle,
        transform: isActive ? 'translateX(0)' : 'translateX(100%)',
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0
      };
    }

    if (effect === 'fade') {
      return {
        ...baseStyle,
        opacity: isActive ? 1 : 0,
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0
      };
    }

    return baseStyle;
  };

  return (
    <div className={classes} style={getItemStyle()} {...props}>
      {children}
    </div>
  );
};

CarouselItem.propTypes = {
  children: PropTypes.node,
  isActive: PropTypes.bool,
  effect: PropTypes.oneOf(['slide', 'fade']),
  easing: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default CarouselItem;
