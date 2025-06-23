import React from 'react';
import PropTypes from 'prop-types';
import './Loading.scss';

const Loading = ({
  spinning = true,
  size = 'default',
  tip,
  fullScreen = false,
  delay = 0,
  wrapperClassName = '',
  className = '',
  style = {},
  children,
  ...props
}) => {
  const [shouldShow, setShouldShow] = React.useState(!delay);
  const [delayTimer, setDelayTimer] = React.useState(null);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      setDelayTimer(timer);

      return () => {
        if (delayTimer) {
          clearTimeout(delayTimer);
        }
      };
    }
  }, [delay]);

  const baseClass = 'custom-loading';

  const spinnerClasses = [
    `${baseClass}__spinner`,
    `${baseClass}__spinner--${size}`,
    className
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    `${baseClass}-wrapper`,
    spinning ? `${baseClass}-wrapper--active` : '',
    fullScreen ? `${baseClass}-wrapper--fullscreen` : '',
    wrapperClassName
  ].filter(Boolean).join(' ');

  const renderSpinner = () => (
    <div className={spinnerClasses} style={style} {...props}>
      <span className={`${baseClass}__dot`} />
      <span className={`${baseClass}__dot`} />
      <span className={`${baseClass}__dot`} />
      {tip && <div className={`${baseClass}__tip`}>{tip}</div>}
    </div>
  );

  // 如果是全屏模式，直接渲染spinner
  if (fullScreen) {
    return spinning && shouldShow ? (
      <div className={wrapperClasses}>
        {renderSpinner()}
      </div>
    ) : null;
  }

  // 如果没有子元素，只渲染spinner
  if (!children) {
    return spinning && shouldShow ? renderSpinner() : null;
  }

  // 如果有子元素，渲染带有包装器的spinner
  return (
    <div className={wrapperClasses}>
      {children}
      {spinning && shouldShow && renderSpinner()}
    </div>
  );
};

Loading.propTypes = {
  spinning: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  tip: PropTypes.node,
  fullScreen: PropTypes.bool,
  delay: PropTypes.number,
  wrapperClassName: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

// 添加静态方法用于创建全屏loading
Loading.service = (() => {
  let instance = null;

  return {
    show: (options = {}) => {
      if (!instance) {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const props = {
          ...options,
          spinning: true,
          fullScreen: true
        };

        // 使用React.render渲染Loading组件
        const ReactDOM = require('react-dom');
        instance = ReactDOM.render(<Loading {...props} />, div);
      }
      return instance;
    },
    hide: () => {
      if (instance) {
        const ReactDOM = require('react-dom');
        const unmountResult = ReactDOM.unmountComponentAtNode(
          instance.parentNode
        );
        if (unmountResult && instance.parentNode) {
          document.body.removeChild(instance.parentNode);
        }
        instance = null;
      }
    }
  };
})();

export default Loading;
