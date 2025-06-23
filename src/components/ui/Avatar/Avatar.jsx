import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Avatar.scss';

const Avatar = ({
  shape = 'circle',
  size = 'default',
  icon,
  src,
  srcSet,
  alt,
  children,
  draggable = true,
  onError,
  gap = 4,
  className = '',
  style = {},
  ...props
}) => {
  const [isImgExist, setIsImgExist] = useState(true);
  const [scale, setScale] = useState(1);

  // 处理图片加载失败
  const handleImgLoadError = (e) => {
    const errorFlag = onError ? onError(e) : undefined;
    if (errorFlag !== false) {
      setIsImgExist(false);
    }
  };

  // 计算文本缩放比例
  useEffect(() => {
    if (!children || typeof children !== 'string' || !isImgExist) {
      return;
    }

    const childrenLength = children.length;
    if (childrenLength <= 2) {
      setScale(1);
    } else {
      setScale(2 / childrenLength);
    }
  }, [children, isImgExist]);

  // 获取尺寸样式
  const getSizeStyle = () => {
    if (typeof size === 'number') {
      return {
        width: size,
        height: size,
        lineHeight: `${size}px`,
        fontSize: icon ? size / 2 : 18,
      };
    }

    return {};
  };

  // 构建类名
  const baseClass = 'custom-avatar';
  const classes = [
    baseClass,
    `${baseClass}--${shape}`,
    typeof size === 'string' && `${baseClass}--${size}`,
    className
  ].filter(Boolean).join(' ');

  // 构建样式
  const avatarStyle = {
    ...getSizeStyle(),
    ...style,
  };

  // 渲染内容
  const renderContent = () => {
    if (src && isImgExist) {
      return (
        <img
          src={src}
          srcSet={srcSet}
          alt={alt}
          draggable={draggable}
          onError={handleImgLoadError}
        />
      );
    }

    if (icon) {
      return icon;
    }

    if (children) {
      const childrenStyle = {
        transform: `scale(${scale}) translateX(-50%)`,
        lineHeight: 'normal',
        marginLeft: '50%',
      };

      return (
        <span
          className={`${baseClass}__string`}
          style={childrenStyle}
        >
          {children}
        </span>
      );
    }

    return null;
  };

  return (
    <span className={classes} style={avatarStyle} {...props}>
      {renderContent()}
    </span>
  );
};

Avatar.propTypes = {
  shape: PropTypes.oneOf(['circle', 'square']),
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['large', 'default', 'small'])]),
  icon: PropTypes.node,
  src: PropTypes.string,
  srcSet: PropTypes.string,
  alt: PropTypes.string,
  children: PropTypes.node,
  draggable: PropTypes.bool,
  onError: PropTypes.func,
  gap: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object
};

// Avatar组
Avatar.Group = ({
  children,
  maxCount,
  maxStyle,
  size,
  className = '',
  ...props
}) => {
  const baseClass = 'custom-avatar-group';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  // 处理子元素
  const childrenWithProps = React.Children.toArray(children).map((child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        size,
        key: `avatar-key-${index}`
      });
    }
    return child;
  });

  // 处理最大显示数量
  const childrenShow = maxCount
    ? childrenWithProps.slice(0, maxCount)
    : childrenWithProps;

  // 渲染额外数量
  const renderMaxCount = () => {
    if (!maxCount || childrenWithProps.length <= maxCount) {
      return null;
    }

    const restCount = childrenWithProps.length - maxCount;
    const maxCountStyle = {
      ...maxStyle,
    };

    return (
      <Avatar
        size={size}
        style={maxCountStyle}
        className={`${baseClass}__max-count`}
      >
        +{restCount}
      </Avatar>
    );
  };

  return (
    <div className={classes} {...props}>
      {childrenShow}
      {renderMaxCount()}
    </div>
  );
};

Avatar.Group.propTypes = {
  children: PropTypes.node,
  maxCount: PropTypes.number,
  maxStyle: PropTypes.object,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['large', 'default', 'small'])]),
  className: PropTypes.string
};

export default Avatar;
