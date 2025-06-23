import React from 'react';
import PropTypes from 'prop-types';
import './Card.scss';

const Card = ({
  title,
  extra,
  children,
  bordered = true,
  hoverable = false,
  loading = false,
  size = 'default',
  cover,
  actions = [],
  className = '',
  style = {},
  headStyle = {},
  bodyStyle = {},
  ...props
}) => {
  const baseClass = 'custom-card';

  const classes = [
    baseClass,
    bordered ? `${baseClass}--bordered` : '',
    hoverable ? `${baseClass}--hoverable` : '',
    loading ? `${baseClass}--loading` : '',
    `${baseClass}--${size}`,
    className
  ].filter(Boolean).join(' ');

  // 渲染加载状态
  const renderLoading = () => {
    return (
      <div className={`${baseClass}__loading-content`}>
        <div className={`${baseClass}__loading-block`} style={{ width: '94%' }}></div>
        <div className={`${baseClass}__loading-block`} style={{ width: '28%' }}></div>
        <div className={`${baseClass}__loading-block`} style={{ width: '66%' }}></div>
        <div className={`${baseClass}__loading-block`} style={{ width: '38%' }}></div>
        <div className={`${baseClass}__loading-block`} style={{ width: '80%' }}></div>
      </div>
    );
  };

  // 渲染头部
  const renderHeader = () => {
    if (!title && !extra) return null;

    return (
      <div className={`${baseClass}__header`} style={headStyle}>
        {title && <div className={`${baseClass}__title`}>{title}</div>}
        {extra && <div className={`${baseClass}__extra`}>{extra}</div>}
      </div>
    );
  };

  // 渲染封面
  const renderCover = () => {
    if (!cover) return null;

    return (
      <div className={`${baseClass}__cover`}>
        {cover}
      </div>
    );
  };

  // 渲染操作区
  const renderActions = () => {
    if (!actions.length) return null;

    return (
      <ul className={`${baseClass}__actions`}>
        {actions.map((action, index) => (
          <li key={`action-${index}`} className={`${baseClass}__action`}>
            {action}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={classes} style={style} {...props}>
      {renderHeader()}
      {renderCover()}
      <div className={`${baseClass}__body`} style={bodyStyle}>
        {loading ? renderLoading() : children}
      </div>
      {renderActions()}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.node,
  extra: PropTypes.node,
  children: PropTypes.node,
  bordered: PropTypes.bool,
  hoverable: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['default', 'small']),
  cover: PropTypes.node,
  actions: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  style: PropTypes.object,
  headStyle: PropTypes.object,
  bodyStyle: PropTypes.object
};

export default Card;
