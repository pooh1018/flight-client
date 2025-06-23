import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormItem } from './FormItem';
import './index.scss';

// 创建 Form 上下文
const FormContext = createContext({});

// Form 组件
const InnerForm = ({
  form,
  initialValues = {},
  rules = {},
  onFinish,
  onFinishFailed,
  children,
  className = '',
  labelPosition = 'top',
  ...rest
}) => {
  // 内部状态管理
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当 initialValues 改变时更新表单值
  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      ...initialValues
    }));
  }, [initialValues]);

  // 设置表单值
  const setFieldsValue = (values) => {
    setFormValues(prev => {
      const newValues = { ...prev, ...values };

      // 如果提供了 onValuesChange 回调，则调用它
      if (rest.onValuesChange) {
        const changedValues = {};
        Object.keys(values).forEach(key => {
          if (prev[key] !== values[key]) {
            changedValues[key] = values[key];
          }
        });

        if (Object.keys(changedValues).length > 0) {
          rest.onValuesChange(changedValues, newValues);
        }
      }

      return newValues;
    });
  };

  // 获取表单值
  const getFieldValue = (name) => {
    return formValues[name];
  };

  // 获取所有表单值
  const getFieldsValue = () => {
    return { ...formValues };
  };

  // 重置表单
  const resetFields = () => {
    setFormValues(initialValues);
    setFormErrors({});
  };

  // 验证单个字段
  const validateField = async (name) => {
    if (!rules[name]) return true;

    const value = formValues[name];
    const fieldRules = Array.isArray(rules[name]) ? rules[name] : [rules[name]];

    try {
      for (const rule of fieldRules) {
        if (rule.required && (value === undefined || value === null || value === '')) {
          throw new Error(rule.message || `${name} is required`);
        }

        if (rule.validator) {
          await rule.validator(rule, value);
        }
      }

      // 验证通过，清除错误
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    } catch (error) {
      // 验证失败，设置错误
      setFormErrors(prev => ({
        ...prev,
        [name]: error.message
      }));

      return false;
    }
  };

  // 验证所有字段
  const validateFields = async () => {
    const fieldNames = Object.keys(rules);
    const results = await Promise.all(fieldNames.map(name => validateField(name)));
    return results.every(result => result);
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = await validateFields();
      if (isValid) {
        onFinish?.(getFieldsValue());
      } else {
        onFinishFailed?.({
          values: getFieldsValue(),
          errors: formErrors
        });
      }
    } catch (error) {
      console.error('Form validation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提供给 FormItem 的上下文
  const formContext = {
    formValues,
    formErrors,
    setFieldValue: (name, value) => {
      setFormValues(prev => {
        const newValues = {
          ...prev,
          [name]: value
        };

        // 如果提供了 onValuesChange 回调，则调用它
        if (rest.onValuesChange) {
          rest.onValuesChange({ [name]: value }, newValues);
        }

        return newValues;
      });
    },
    getFieldValue,
    validateField,
    labelPosition
  };

  // 如果提供了 form 实例，则将方法附加到它
  if (form) {
    form.setFieldsValue = setFieldsValue;
    form.getFieldValue = getFieldValue;
    form.getFieldsValue = getFieldsValue;
    form.resetFields = resetFields;
    form.validateFields = validateFields;
    form.validateField = validateField;
  }

  return (
    <FormContext.Provider value={formContext}>
      <form
        className={`ui-form ui-form-${labelPosition} ${className}`}
        onSubmit={handleSubmit}
        {...rest}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form 实例创建函数
const useForm = () => {
  const form = {};
  return [form];
};

// 组合 Form 组件和 FormItem 子组件
const Form = Object.assign(InnerForm, {
  Item: FormItem,
  useForm
});

InnerForm.propTypes = {
  form: PropTypes.object,
  initialValues: PropTypes.object,
  rules: PropTypes.object,
  onFinish: PropTypes.func,
  onFinishFailed: PropTypes.func,
  onValuesChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'left', 'right'])
};

// 导出 Form 上下文供 FormItem 使用
export { FormContext, Form };
