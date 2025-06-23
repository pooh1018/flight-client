import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Radio.scss';

const Radio = ({
  checked,
  defaultChecked = false,
  disabled = false,
  value,
  onChange,
  className = '',
  children,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const baseClass = 'custom-radio';

  const controlledChecked = checked !== undefined ? checked : isChecked;

  const classes = [
    baseClass,
    controlledChecked ? `${baseClass}--checked` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (disabled) return;

    const newChecked = e.target.checked;

    if (checked === undefined) {
      setIsChecked(newChecked);
    }

    onChange?.(e);
  };

  return (
    <label className={classes}>
      <span className={`${baseClass}__input-wrapper`}>
        <input
          type="radio"
          className={`${baseClass}__input`}
          checked={controlledChecked}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <span className={`${baseClass}__inner`}></span>
      </span>
      {children && <span className={`${baseClass}__label`}>{children}</span>}
    </label>
  );
};

Radio.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

// Radio Group Component
const RadioGroup = ({
  options = [],
  value,
  defaultValue,
  disabled = false,
  name,
  onChange,
  className = '',
  ...props
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const baseClass = 'custom-radio-group';

  const controlledValue = value !== undefined ? value : selectedValue;

  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  const handleRadioChange = (e) => {
    const newValue = e.target.value;

    if (value === undefined) {
      setSelectedValue(newValue);
    }

    onChange?.(e);
  };

  return (
    <div className={classes} {...props}>
      {options.map((option) => {
        const optionProps = typeof option === 'object' ? option : { value: option, label: option };
        const { value: optionValue, label, disabled: optionDisabled = false } = optionProps;

        return (
          <Radio
            key={optionValue}
            checked={controlledValue === optionValue}
            disabled={disabled || optionDisabled}
            value={optionValue}
            onChange={handleRadioChange}
            name={name}
            className={`${baseClass}__item`}
          >
            {label}
          </Radio>
        );
      })}
    </div>
  );
};

RadioGroup.propTypes
 = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        label: PropTypes.node,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        disabled: PropTypes.bool
      })
    ])
  ),
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string
};

// Radio Button Component
const RadioButton = ({
  checked,
  defaultChecked = false,
  disabled = false,
  value,
  onChange,
  className = '',
  children,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const baseClass = 'custom-radio-button';

  const controlledChecked = checked !== undefined ? checked : isChecked;

  const classes = [
    baseClass,
    controlledChecked ? `${baseClass}--checked` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (disabled) return;

    const newChecked = e.target.checked;

    if (checked === undefined) {
      setIsChecked(newChecked);
    }

    onChange?.(e);
  };

  return (
    <label className={classes}>
      <input
        type="radio"
        className={`${baseClass}__input`}
        checked={controlledChecked}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        {...props}
      />
      <span className={`${baseClass}__label`}>{children}</span>
    </label>
  );
};

RadioButton.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

Radio.Group = RadioGroup;
Radio.Button = RadioButton;

export default Radio;
export { RadioGroup, RadioButton };
