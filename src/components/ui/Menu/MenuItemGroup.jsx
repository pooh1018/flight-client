import React from 'react';
import PropTypes from 'prop-types';

const MenuItemGroup = ({
  title,
  className = '',
  style = {},
  children,
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-menu-item-group';
  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <li className={classes} style={style} {...props}>
      {title && (
        <div className={`${baseClass}__title`} role="presentation">
          {title}
        </div>
      )}
      <ul className={`${baseClass}__list`} role="group">
        {children}
      </ul>
    </li>
  );
};

MenuItemGroup.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

export default MenuItemGroup;
