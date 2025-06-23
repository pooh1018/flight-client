import React, { useState } from 'react';
import { Form, Input, Button, Message, FormItem } from '@/components/ui';
import './AuthForm.css';

// 密码验证规则
const passwordRules = [
  {
    required: true,
    message: '请输入新密码'
  },
  {
    min: 6,
    message: '密码长度不能小于6位'
  },
  // {
  //   validator: (_, value) => {
  //     if (!value) return Promise.resolve();
  //
  //     const errors = [];
  //     if (!/[A-Z]/.test(value)) {
  //       errors.push('密码必须包含至少一个大写字母');
  //     }
  //     if (!/[a-z]/.test(value)) {
  //       errors.push('密码必须包含至少一个小写字母');
  //     }
  //     if (!/[0-9]/.test(value)) {
  //       errors.push('密码必须包含至少一个数字');
  //     }
  //     if (!/[!@#$%^&*]/.test(value)) {
  //       errors.push('密码必须包含至少一个特殊字符(!@#$%^&*)');
  //     }
  //
  //     return errors.length ? Promise.reject(errors[0]) : Promise.resolve();
  //   }
  // }
];

// 确认密码验证规则函数
const getConfirmPasswordRules = (form) => [
  {
    required: true,
    message: '请确认密码'
  },
  {
    validator: (_, value) => {
      if (!value) {
        return Promise.resolve();
      }
      if (value !== form.getFieldValue('password')) {
        return Promise.reject('两次输入的密码不一致');
      }
      return Promise.resolve();
    }
  }
];

const ResetPasswordForm = ({ onResetPassword, onSwitchToLogin, email }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 移除独立的验证函数，已经在常量中定义

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 添加邮箱到表单数据
      const resetData = {
        password: values.password,
        email
      };

      // 调用父组件提供的重置密码回调
      await onResetPassword(resetData);

      // 重置表单
      form.resetFields();

      // 显示成功消息
      Message.success('密码重置成功，请使用新密码登录');

      // 切换到登录页面
      onSwitchToLogin();
    } catch (error) {
      console.error('Reset password failed:', error);

      // 显示错误消息
      Message.error(error.message || '密码重置失败，请稍后重试');

      // 如果有表单错误处理
      if (error.fieldErrors) {
        const fieldErrors = {};
        Object.keys(error.fieldErrors).forEach(field => {
          fieldErrors[field] = {
            errors: [error.fieldErrors[field]]
          };
        });
        form.setFields(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">重置密码</h2>
      <p className="auth-form__subtitle">为账号 {email} 设置新密码</p>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        className="auth-form__form"
      >
        <Form.Item
          name="password"
          label="新密码"
          validateTrigger="onBlur"
          rules={passwordRules}
        >
          <Input
            type="password"
            placeholder="请输入新密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          validateTrigger="onBlur"
          rules={getConfirmPasswordRules(form)}
        >
          <Input
            type="password"
            placeholder="请再次输入新密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <div className="auth-form__footer">
          <Button
            type="text"
            onClick={onSwitchToLogin}
            className="auth-form__back-btn"
          >
            返回登录
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="auth-form__submit-btn"
          >
            重置密码
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
