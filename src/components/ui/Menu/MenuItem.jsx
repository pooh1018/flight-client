import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { MenuContext } from './Menu';

const MenuItem = ({
  key: itemKey,
  disabled = false,
  icon = null,
  className = '',
  style = {},
  children,
  onClick,
  ...props
}) => {
  // 获取菜单上下文
  const { selectedKeys, onSelect } = useContext(MenuContext);

  // 判断是否选中
  const isSelected = selectedKeys.includes(itemKey);

  // 构建类名
  const baseClass = 'custom-menu-item';
  const classes = [
    baseClass,
    isSelected ? `${baseClass}--selected` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  // 处理点击事件
  const handleClick = (e) => {
    if (disabled) {
      return;
    }

    if (onClick) {
      onClick(e);
    }

    onSelect(itemKey, e);
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  };

  return (
    <li
      className={classes}
      style={style}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-selected={isSelected}
      {...props}
    >
      {icon && <span className={`${baseClass}__icon`}>{icon}</span>}
      <span className={`${baseClass}__content`}>{children}</span>
    </li>
  );
};

MenuItem.propTypes = {
  key: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default MenuItem;
