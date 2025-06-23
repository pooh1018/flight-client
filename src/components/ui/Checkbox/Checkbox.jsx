import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Checkbox.scss';

const Checkbox = ({
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className = '',
  children,
  valuePropName, // 解构但不使用，防止传递给DOM
  ...restProps // 只传递合法的DOM属性
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const baseClass = 'custom-checkbox';

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
          type="checkbox"
          className={`${baseClass}__input`}
          checked={controlledChecked}
          disabled={disabled}
          onChange={handleChange}
          {...restProps}
        />
        <span className={`${baseClass}__inner`}></span>
      </span>
      {children && <span className={`${baseClass}__label`}>{children}</span>}
    </label>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

// Checkbox Group Component
const CheckboxGroup = ({
  options = [],
  value = [],
  defaultValue = [],
  disabled = false,
  onChange,
  className = '',
  ...props
}) => {
  const [selectedValues, setSelectedValues] = useState(defaultValue);
  const baseClass = 'custom-checkbox-group';

  const controlledValues = value !== undefined ? value : selectedValues;

  const classes = [
    baseClass,
    className
  ].filter(Boolean).join(' ');

  const handleCheckboxChange = (e, option) => {
    const optionValue = typeof option === 'object' ? option.value : option;
    const newValues = [...controlledValues];

    if (e.target.checked) {
      if (!newValues.includes(optionValue)) {
        newValues.push(optionValue);
      }
    } else {
      const index = newValues.indexOf(optionValue);
      if (index !== -1) {
        newValues.splice(index, 1);
      }
    }

    if (value === undefined) {
      setSelectedValues(newValues);
    }

    onChange?.(newValues);
  };

  return (
    <div className={classes} {...props}>
      {options.map((option) => {
        const optionProps = typeof option === 'object' ? option : { value: option, label: option };
        const { value: optionValue, label, disabled: optionDisabled = false } = optionProps;

        return (
          <Checkbox
            key={optionValue}
            checked={controlledValues.includes(optionValue)}
            disabled={disabled || optionDisabled}
            onChange={(e) => handleCheckboxChange(e, option)}
            className={`${baseClass}__item`}
          >
            {label}
          </Checkbox>
        );
      })}
    </div>
  );
};

CheckboxGroup.propTypes = {
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
  value: PropTypes.array,
  defaultValue: PropTypes.array,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string
};

Checkbox.Group = CheckboxGroup;

export default Checkbox;
