import React from 'react';
import PropTypes from 'prop-types';

const SkeletonParagraph = ({
  rows = 3,
  width = undefined,
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-skeleton-paragraph';
  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  // 处理宽度配置
  const getWidth = (index) => {
    if (Array.isArray(width)) {
      return width[index];
    }

    // 最后一行宽度较短
    if (index === rows - 1) {
      return '61%';
    }

    return '100%';
  };

  return (
    <div className={classes} style={style} {...props}>
      {Array.from({ length: rows }).map((_, index) => {
        const rowWidth = getWidth(index);
        const rowStyle = {
          width: typeof rowWidth === 'number' ? `${rowWidth}px` : rowWidth
        };

        return (
          <div
            key={index}
            className={`${baseClass}__row`}
            style={rowStyle}
          />
        );
      })}
    </div>
  );
};

SkeletonParagraph.propTypes = {
  rows: PropTypes.number,
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
  ]),
  className: PropTypes.string,
  style: PropTypes.object
};

export default SkeletonParagraph;
