import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Notification.scss';

// 单个通知组件
const NotificationItem = ({
  type = 'info',
  title,
  message,
  duration = 4.5,
  onClose,
  id,
  placement = 'topRight',
  className = '',
  style = {},
  ...props
}) => {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let timer;
    if (duration > 0) {
      timer = setTimeout(() => {
        close();
      }, duration * 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [duration]);

  const close = () => {
    setAnimating(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, 300); // 动画持续时间
  };

  if (!visible) {
    return null;
  }

  const baseClass = 'custom-notification';
  const classes = [
    baseClass,
    `${baseClass}--${type}`,
    animating ? `${baseClass}--leaving` : '',
    className
  ].filter(Boolean).join(' ');

  // 根据类型选择图标
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"
              fill="currentColor"
            />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
              fill="currentColor"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"
              fill="currentColor"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v48zm0-112c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v320z"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  return (
    <div className={classes} style={style} {...props}>
      <div className={`${baseClass}__icon`}>{getIcon()}</div>
      <div className={`${baseClass}__content`}>
        {title && <div className={`${baseClass}__title`}>{title}</div>}
        {message && <div className={`${baseClass}__message`}>{message}</div>}
      </div>
      <div className={`${baseClass}__close`} onClick={close}>
        <svg viewBox="0 0 1024 1024" width="14" height="14">
          <path
            d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.node,
  message: PropTypes.node,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  id: PropTypes.string,
  placement: PropTypes.oneOf(['topRight', 'topLeft', 'bottomRight', 'bottomLeft']),
  className: PropTypes.string,
  style: PropTypes.object
};

// 通知容器组件
const NotificationContainer = ({ placement = 'topRight' }) => {
  const [notifications, setNotifications] = useState([]);

  // 添加通知
  const add = (notification) => {
    setNotifications((prevNotifications) => [...prevNotifications, notification]);
  };

  // 移除通知
  const remove = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notice) => notice.id !== id));
  };

  // 暴露方法给外部使用
  React.useImperativeHandle(NotificationContainer.refs[placement], () => ({
    add,
    remove
  }));

  return (
    <div className={`custom-notification-container custom-notification-container--${placement}`}>
      {notifications.map((notice) => (
        <NotificationItem
          key={notice.id}
          {...notice}
          onClose={remove}
        />
      ))}
    </div>
  );
};

// 创建静态引用
NotificationContainer.refs = {
  topRight: React.createRef(),
  topLeft: React.createRef(),
  bottomRight: React.createRef(),
  bottomLeft: React.createRef()
};

// 创建DOM容器
const containers = {};
const notificationInstances = {};

// 获取通知实例
const getInstance = (placement) => {
  if (notificationInstances[placement]) {
    return notificationInstances[placement];
  }

  if (!containers[placement]) {
    containers[placement] = document.createElement('div');
    document.body.appendChild(containers[placement]);
  }

  ReactDOM.render(
    <NotificationContainer
      placement={placement}
      ref={NotificationContainer.refs[placement]}
    />,
    containers[placement]
  );

  notificationInstances[placement] = NotificationContainer.refs[placement].current;
  return notificationInstances[placement];
};

// 创建通知API
const Notification = {
  open: (config) => {
    const placement = config.placement || 'topRight';
    const instance = getInstance(placement);
    const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    instance.add({
      ...config,
      id,
      placement
    });
    return id;
  },
  info: (message, title, duration, onClose, placement) => {
    return Notification.open({
      type: 'info',
      message,
      title,
      duration,
      onClose,
      placement
    });
  },
  success: (message, title, duration, onClose, placement) => {
    return Notification.open({
      type: 'success',
      message,
      title,
      duration,
      onClose,
      placement
    });
  },
  warning: (message, title, duration, onClose, placement) => {
    return Notification.open({
      type: 'warning',
      message,
      title,
      duration,
      onClose,
      placement
    });
  },
  error: (message, title, duration, onClose, placement) => {
    return Notification.open({
      type: 'error',
      message,
      title,
      duration,
      onClose,
      placement
    });
  },
  remove: (id, placement = 'topRight') => {
    if (notificationInstances[placement]) {
      notificationInstances[placement].remove(id);
    }
  },
  destroy: (placement) => {
    if (placement) {
      if (containers[placement]) {
        ReactDOM.unmountComponentAtNode(containers[placement]);
        document.body.removeChild(containers[placement]);
        delete containers[placement];
        delete notificationInstances[placement];
      }
    } else {
      Object.keys(containers).forEach(key => {
        ReactDOM.unmountComponentAtNode(containers[key]);
        document.body.removeChild(containers[key]);
        delete containers[key];
      });
      Object.keys(notificationInstances).forEach(key => {
        delete notificationInstances[key];
      });
    }
  }
};

export default Notification;
