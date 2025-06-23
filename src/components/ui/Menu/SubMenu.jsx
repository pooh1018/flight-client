import React, { useContext, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuContext } from './Menu';

const SubMenu = ({
  key: subMenuKey,
  title,
  icon = null,
  disabled = false,
  className = '',
  style = {},
  children,
  ...props
}) => {
  // 获取菜单上下文
  const { mode, openKeys, onOpenChange } = useContext(MenuContext);

  // 判断是否展开
  const isOpen = openKeys.includes(subMenuKey);

  // 子菜单内容的引用，用于计算高度
  const subMenuContentRef = useRef(null);

  // 子菜单内容的高度，用于动画
  const [contentHeight, setContentHeight] = useState(isOpen ? 'auto' : 0);

  // 当展开状态变化时，更新高度
  useEffect(() => {
    if (isOpen) {
      // 先设置为具体高度，以便动画
      const height = subMenuContentRef.current.scrollHeight;
      setContentHeight(height);

      // 动画结束后设置为auto，以便内容变化时自动调整
      const timer = setTimeout(() => {
        setContentHeight('auto');
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // 先设置为具体高度，以便动画
      const height = subMenuContentRef.current.scrollHeight;
      setContentHeight(height);

      // 强制回流
      subMenuContentRef.current.offsetHeight; // eslint-disable-line no-unused-expressions

      // 然后设置为0，触发动画
      setContentHeight(0);
    }
  }, [isOpen]);

  // 构建类名
  const baseClass = 'custom-submenu';
  const classes = [
    baseClass,
    isOpen ? `${baseClass}--open` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  // 处理点击事件
  const handleTitleClick = (e) => {
    if (disabled) {
      return;
    }

    onOpenChange(subMenuKey, !isOpen);
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTitleClick(e);
    }
  };

  // 渲染子菜单标题
  const renderTitle = () => (
    <div
      className={`${baseClass}__title`}
      onClick={handleTitleClick}
      onKeyPress={handleKeyPress}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-expanded={isOpen}
    >
      {icon && <span className={`${baseClass}__icon`}>{icon}</span>}
      <span className={`${baseClass}__label`}>{title}</span>
      <span className={`${baseClass}__arrow`} />
    </div>
  );

  // 渲染子菜单内容
  const renderContent = () => {
    const contentStyle = {
      height: contentHeight,
      overflow: contentHeight === 'auto' ? 'visible' : 'hidden',
      transition: 'height 0.3s ease'
    };

    return (
      <ul
        className={`${baseClass}__content`}
        style={contentStyle}
        ref={subMenuContentRef}
        role="menu"
      >
        {children}
      </ul>
    );
  };

  return (
    <li className={classes} style={style} {...props}>
      {renderTitle()}
      {renderContent()}
    </li>
  );
};

SubMenu.propTypes = {
  key: PropTypes.string,
  title: PropTypes.node,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

export default SubMenu;
