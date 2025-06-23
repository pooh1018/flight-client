import React from 'react';
import PropTypes from 'prop-types';
import BreadcrumbItem from './BreadcrumbItem';
import './Breadcrumb.scss';

const Breadcrumb = ({
  separator = '/',
  className = '',
  style = {},
  children,
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-breadcrumb';
  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  // 处理子元素，添加分隔符
  const items = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement(child, {
      separator,
      key: index,
      // 最后一项不显示分隔符
      isLast: index === React.Children.count(children) - 1
    });
  });

  return (
    <nav className={classes} style={style} aria-label="Breadcrumb" {...props}>
      <ol className={`${baseClass}__list`}>
        {items}
      </ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  separator: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

Breadcrumb.Item = BreadcrumbItem;

export default Breadcrumb;
