import React, { useContext, useEffect, cloneElement, Children, useState } from 'react';
import PropTypes from 'prop-types';
import { FormContext } from './index';

const FormItem = ({
  name,
  label,
  children,
  noStyle = false,
  className = '',
  required = false,
  ...rest
}) => {
  const {
    formData,
    errors,
    setFieldValue,
    validateField,
    layout
  } = useContext(FormContext);

  const [hasInitialized, setHasInitialized] = useState(false);

  // 获取当前字段的值
  const value = name ? formData?.[name] : undefined;

  // 获取当前字段的错误信息
  const error = name ? errors?.[name] : undefined;

  // 当子组件的值变化时更新表单值
  const handleChange = (...args) => {
    if (name) {
      const value = args[0]?.target?.value ?? args[0];
      setFieldValue(name, value);

      // 在值变化时触发验证
      setTimeout(async () => {
        await validateField(name, value);
      }, 0);
    }
    
    // 调用子组件原始的onChange函数，传递所有参数
    const childOnChange = Children.only(children).props.onChange;
    if (childOnChange && typeof childOnChange === 'function') {
      childOnChange(...args);
    }
  };

  // 处理子组件的 blur 事件
  const handleBlur = async () => {
    if (name) {
      await validateField(name, value);
    }
  };

  // 初始化子组件的值并进行验证
  useEffect(() => {
    const initializeField = async () => {
      if (name && !hasInitialized) {
        // 如果有初始值，进行初始验证
        if (value !== undefined) {
          await validateField(name, value);
        }
        setHasInitialized(true);
      }
    };

    initializeField();
  }, [name, value, validateField, hasInitialized]);

  // 如果没有子组件，直接返回 null
  if (!children) {
    return null;
  }

  // 如果 noStyle 为 true，只渲染子组件
  if (noStyle) {
    return cloneElement(Children.only(children), {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      ...rest
    });
  }

  // 渲染带样式的表单项
  return (
    <div className={`form-item ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label className={`form-item-label ${required ? 'required' : ''}`} style={{
          textAlign: layout === 'horizontal' ? 'right' : 'left'
        }}>
          {label}
        </label>
      )}
      <div className="form-item-control">
        {cloneElement(Children.only(children), {
          value,
          onChange: handleChange,
          onBlur: handleBlur,
          ...rest
        })}
        {error && <div className="form-item-error">{error}</div>}
      </div>
    </div>
  );
};

export default FormItem;

FormItem.propTypes = {
  name: PropTypes.string,
  label: PropTypes.node,
  children: PropTypes.node,
  noStyle: PropTypes.bool,
  className: PropTypes.string,
  required: PropTypes.bool
};
