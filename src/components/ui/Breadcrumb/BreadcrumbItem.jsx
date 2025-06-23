import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const BreadcrumbItem = ({
  separator = '/',
  isLast = false,
  href = '',
  to = '',
  onClick = null,
  className = '',
  style = {},
  children,
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-breadcrumb-item';
  const classes = [
    baseClass,
    isLast ? `${baseClass}--active` : '',
    className
  ].filter(Boolean).join(' ');

  // 渲染内容
  let itemContent;

  if (isLast) {
    // 最后一项，不可点击
    itemContent = (
      <span className={`${baseClass}__content`} aria-current="page">
        {children}
      </span>
    );
  } else if (to) {
    // React Router链接
    itemContent = (
      <Link to={to} className={`${baseClass}__link`} onClick={onClick}>
        {children}
      </Link>
    );
  } else if (href) {
    // 普通HTML链接
    itemContent = (
      <a href={href} className={`${baseClass}__link`} onClick={onClick}>
        {children}
      </a>
    );
  } else if (onClick) {
    // 可点击但不是链接
    itemContent = (
      <span
        className={`${baseClass}__link`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e);
          }
        }}
      >
        {children}
      </span>
    );
  } else {
    // 普通文本
    itemContent = (
      <span className={`${baseClass}__content`}>
        {children}
      </span>
    );
  }

  return (
    <li className={classes} style={style} {...props}>
      {itemContent}
      {!isLast && (
        <span className={`${baseClass}__separator`} aria-hidden="true">
          {separator}
        </span>
      )}
    </li>
  );
};

BreadcrumbItem.propTypes = {
  separator: PropTypes.node,
  isLast: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

export default BreadcrumbItem;
