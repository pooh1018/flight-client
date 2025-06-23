import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.scss';

const Input = forwardRef(({
  type = 'text',
  size = 'middle',
  disabled = false,
  placeholder = '',
  value,
  defaultValue,
  onChange,
  onPressEnter,
  onFocus,
  onBlur,
  prefix = null,
  suffix = null,
  addonBefore = null,
  addonAfter = null,
  allowClear = false,
  className = '',
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [focused, setFocused] = useState(false);

  const baseClass = 'custom-input';
  const controlledValue = value !== undefined ? value : inputValue;

  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    disabled ? `${baseClass}--disabled` : '',
    focused ? `${baseClass}--focused` : '',
    prefix ? `${baseClass}--with-prefix` : '',
    suffix || allowClear ? `${baseClass}--with-suffix` : '',
    addonBefore ? `${baseClass}--with-addon-before` : '',
    addonAfter ? `${baseClass}--with-addon-after` : '',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (disabled) return;

    const newValue = e.target.value;
    if (!('value' in props)) {
      setInputValue(newValue);
    }

    onChange?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
    props.onKeyDown?.(e);
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    const e = Object.create(new Event('input', { bubbles: true }));
    e.target = { value: '' };

    if (!('value' in props)) {
      setInputValue('');
    }

    onChange?.(e);
  };

  const renderClearIcon = () => {
    if (!allowClear || !controlledValue) return null;

    return (
      <span
        className={`${baseClass}__clear-icon`}
        onClick={handleClear}
      >
        <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z" />
        </svg>
      </span>
    );
  };

  const renderInput = () => (
    <input
      ref={ref}
      type={type}
      className={`${baseClass}__input`}
      disabled={disabled}
      placeholder={placeholder}
      value={controlledValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );

  // If we have addons, wrap the input in a container
  if (addonBefore || addonAfter) {
    return (
      <span className={classes}>
        {addonBefore && (
          <span className={`${baseClass}__addon ${baseClass}__addon--before`}>
            {addonBefore}
          </span>
        )}
        <span className={`${baseClass}__wrapper`}>
          {prefix && <span className={`${baseClass}__prefix`}>{prefix}</span>}
          {renderInput()}
          {(suffix || allowClear) && (
            <span className={`${baseClass}__suffix`}>
              {renderClearIcon()}
              {suffix}
            </span>
          )}
        </span>
        {addonAfter && (
          <span className={`${baseClass}__addon ${baseClass}__addon--after`}>
            {addonAfter}
          </span>
        )}
      </span>
    );
  }

  // Simple input with optional prefix/suffix
  return (
    <span className={classes}>
      {prefix && <span className={`${baseClass}__prefix`}>{prefix}</span>}
      {renderInput()}
      {(suffix || allowClear) && (
        <span className={`${baseClass}__suffix`}>
          {renderClearIcon()}
          {suffix}
        </span>
      )}
    </span>
  );
});

Input.propTypes = {
  type: PropTypes.string,
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onPressEnter: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  addonBefore: PropTypes.node,
  addonAfter: PropTypes.node,
  allowClear: PropTypes.bool,
  className: PropTypes.string
};

// Password Input Component
const Password = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  const passwordIcon = (
    <span
      className="custom-input__password-icon"
      onClick={toggleVisibility}
    >
      {visible ? (
        <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" />
        </svg>
      ) : (
        <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z" />
          <path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z" />
        </svg>
      )}
    </span>
  );

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      suffix={passwordIcon}
      {...props}
    />
  );
});

Password.propTypes = Input.propTypes;

Input.Password = Password;

export default Input;
