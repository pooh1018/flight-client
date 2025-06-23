import React, { createContext, useState, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import './Form.scss';

// 创建表单上下文
export const FormContext = createContext({});

// 创建表单实例的工厂函数
export const useForm = (initialValues = {}) => {
  const [formData, setFormData] = useState({ ...initialValues });
  const [errors, setErrors] = useState({});

  // 存储字段验证器的对象
  const validators = {};

  const formInstance = {
    getFieldValue: (name) => formData[name],
    getFieldsValue: () => ({ ...formData }),
    setFieldValue: (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    setFieldsValue: (values) => {
      setFormData(prev => ({ ...prev, ...values }));
    },
    resetFields: () => {
      setFormData({ ...initialValues });
      setErrors({});
    },
    validateFields: async () => {
      // 收集所有验证错误
      const newErrors = {};
      let hasError = false;

      // 使用注册的验证器验证每个字段
      const validationPromises = Object.keys(validators).map(async (fieldName) => {
        try {
          const value = formData[fieldName];
          const error = await validators[fieldName](value);

          if (error) {
            newErrors[fieldName] = error;
            hasError = true;
          }
        } catch (err) {
          newErrors[fieldName] = err.message || '验证失败';
          hasError = true;
        }
      });

      // 等待所有验证完成
      await Promise.all(validationPromises);

      // 更新错误状态
      setErrors(newErrors);

      // 如果有错误，抛出错误信息
      if (hasError) {
        throw { values: formData, errors: newErrors };
      }

      // 返回验证通过的表单数据
      return { ...formData };
    },
    setFields: (fields) => {
      const newErrors = { ...errors };

      fields.forEach(field => {
        if (field.errors && field.errors.length > 0) {
          newErrors[field.name] = field.errors[0];
        } else {
          delete newErrors[field.name];
        }
      });

      setErrors(newErrors);
    },
    submit: () => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    },
    // 注册字段验证器
    _registerValidator: (name, validator) => {
      validators[name] = validator;
    },
    // 注销字段验证器
    _unregisterValidator: (name) => {
      delete validators[name];
    }
  };

  return [formInstance, formData, setFormData, errors, setErrors];
};

// 表单组件
const InnerForm = ({
  form,
  model, // 添加 model 属性支持
  rules = {}, // 添加 rules 属性支持
  initialValues = {},
  layout = 'vertical',
  labelPosition, // 添加 labelPosition 属性支持
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  onFinish,
  onFinishFailed,
  className = '',
  style = {},
  children,
  forwardedRef,
  ...props
}) => {
  // 生成唯一的表单ID
  const formId = React.useId();

  // 处理 labelPosition 属性，使其与 layout 属性兼容
  const effectiveLayout = labelPosition ? labelPosition : layout;

  // 使用传入的表单实例或创建新的表单实例
  let formInstance, formData, setFormData, errors, setErrors;

  if (form) {
    // 如果传入的是表单实例对象
    formInstance = form;
    // 使用表单实例的方法获取数据
    formData = form.getFieldsValue();
    // 创建一个新的表单实例来获取其他需要的函数
    const [, , setFormDataTemp, errorsTemp, setErrorsTemp] = useForm(initialValues);
    setFormData = (values) => {
      if (typeof values === 'function') {
        const newValues = values(formData);
        form.setFieldsValue(newValues);
      } else {
        form.setFieldsValue(values);
      }
    };
    errors = errorsTemp;
    setErrors = setErrorsTemp;
  } else if (model) {
    // 如果传入的是 model 对象（兼容 element-ui 风格的 API）
    // 创建一个新的表单实例
    [formInstance, formData, setFormData, errors, setErrors] = useForm(model);
    // 确保表单数据与 model 同步，只在 model 实际变化时更新
    useEffect(() => {
      if (model) {
        setFormData(prevData => {
          // 简单比较 model 和 prevData 的键值是否相同
          const modelKeys = Object.keys(model);
          const prevDataKeys = Object.keys(prevData || {});
          
          // 如果键的数量不同，则认为数据已变化
          if (modelKeys.length !== prevDataKeys.length) {
            return model;
          }
          
          // 检查每个键的值是否相同
          for (const key of modelKeys) {
            if (model[key] !== (prevData || {})[key]) {
              return model;
            }
          }
          
          // 如果所有键值都相同，则保持原状态
          return prevData;
        });
      }
    }, [model]);
  } else {
    // 如果没有传入表单实例，则创建新的
    [formInstance, formData, setFormData, errors, setErrors] = useForm(initialValues);
  }

  // 验证单个字段
  const validateField = async (name, value, fieldRules = [], validator) => {
    // 获取字段的验证规则，优先使用传入的规则，如果没有则使用表单级别的规则
    const rulesForField = fieldRules.length > 0 ? fieldRules : (rules[name] || []);
    
    if (!rulesForField.length && !validator) return '';

    try {
      // 自定义验证器
      if (validator) {
        const result = await Promise.resolve(validator(value, formData));
        if (result === true) return '';
        return result || '验证失败';
      }

      // 规则验证
      for (const rule of rulesForField) {
        // 必填验证
        if (rule.required && (value === undefined || value === null || value === '')) {
          throw new Error(rule.message || `${name} 是必填项`);
        }

        // 邮箱类型验证
        if (rule.type === 'email' && value) {
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailPattern.test(value)) {
            throw new Error(rule.message || `请输入有效的邮箱地址`);
          }
        }

        // 正则验证
        if (rule.pattern && !rule.pattern.test(value)) {
          throw new Error(rule.message || `${name} 格式不正确`);
        }

        // 最小长度验证
        if (rule.min !== undefined && value.length < rule.min) {
          throw new Error(rule.message || `${name} 长度不能小于 ${rule.min}`);
        }

        // 最大长度验证
        if (rule.max !== undefined && value.length > rule.max) {
          throw new Error(rule.message || `${name} 长度不能大于 ${rule.max}`);
        }

        // 自定义规则验证
        if (rule.validator) {
          const result = await Promise.resolve(rule.validator(value, formData));
          if (result !== true) {
            throw new Error(result || rule.message || '验证失败');
          }
        }
      }

      // 如果所有验证都通过，返回空字符串
      return '';
    } catch (error) {
      // 更新错误状态
      setErrors(prev => ({
        ...prev,
        [name]: error.message
      }));
      return error.message;
    }
  };

  // 更新表单数据
  const updateFormData = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 验证所有表单项
  const validateFields = async () => {
    try {
      // 使用表单实例的验证方法，它会使用注册的验证器
      const values = await formInstance.validateFields();
      return values;
    } catch (errorInfo) {
      // 更新组件的错误状态
      setErrors(errorInfo.errors || {});
      throw errorInfo;
    }
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 使用表单实例的验证方法
      const values = await formInstance.validateFields();
      // 成功时调用 onFinish
      if (onFinish) {
        await onFinish(values);
      }
    } catch (errorInfo) {
      // 失败时更新错误状态并调用 onFinishFailed
      setErrors(errorInfo.errors || {});
      if (onFinishFailed) {
        onFinishFailed(errorInfo);
      }
    }
  };

  // 重置表单
  const resetFields = () => {
    formInstance.resetFields();
    // 重置状态
    setFormData({ ...initialValues });
    setErrors({});
  };

  const contextValue = {
    layout: effectiveLayout,
    labelCol,
    wrapperCol,
    formData,
    errors,
    setErrors,
    updateFormData,
    validateField,
    validateFields,
    resetFields,
    form: formInstance,
    // 添加更多上下文值以支持表单项的功能
    setFieldValue: formInstance.setFieldValue,
    getFieldValue: formInstance.getFieldValue,
    setFields: formInstance.setFields,
    rules // 添加 rules 到上下文
  };

  // 使用 useImperativeHandle 自定义通过 ref 暴露的实例值
  useImperativeHandle(forwardedRef, () => ({
    // 保持原有的表单方法
    ...formInstance,
    // 添加 validate 方法，支持回调形式和 Promise 形式
    validate: (callback) => {
      const validatePromise = async () => {
        try {
          const values = await formInstance.validateFields();
          return { valid: true, values };
        } catch (errorInfo) {
          return { valid: false, errors: errorInfo.errors };
        }
      };

      // 如果提供了回调函数，使用回调形式
      if (typeof callback === 'function') {
        validatePromise().then(result => {
          callback(result.valid, result.values, result.errors);
        });
      } else {
        // 否则返回 Promise
        return validatePromise();
      }
    },
    // 添加 state 对象，包含 form 属性
    state: {
      form: formData
    },
    // 添加 rules 属性
    rules
  }), [formInstance, formData, rules]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        id={formId}
        className={`form form--${effectiveLayout} ${className}`}
        style={style}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

InnerForm.propTypes = {
  form: PropTypes.object,
  model: PropTypes.object, // 添加 model 属性
  rules: PropTypes.object, // 添加 rules 属性
  initialValues: PropTypes.object,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  labelPosition: PropTypes.oneOf(['horizontal', 'vertical', 'inline']), // 添加 labelPosition 属性
  labelCol: PropTypes.shape({
    span: PropTypes.number
  }),
  wrapperCol: PropTypes.shape({
    span: PropTypes.number
  }),
  onFinish: PropTypes.func,
  onFinishFailed: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  forwardedRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

// 使用 forwardRef 包装组件
const ForwardedForm = React.forwardRef((props, ref) => (
  <InnerForm {...props} forwardedRef={ref} />
));

// 将 useForm 作为 ForwardedForm 的静态方法
ForwardedForm.useForm = useForm;

export default ForwardedForm;
