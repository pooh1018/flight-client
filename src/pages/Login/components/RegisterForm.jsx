import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Message } from '@/components/ui';
import { encrypt } from "@/utils/rsaEncrypt";
import { register } from '@/services/loginApi';
import { COUNTRY_OPTIONS } from '@/config';
import './AuthForm.css';

// 邮箱验证规则
const emailRules = [
  {
    required: true,
    message: '请输入邮箱',
    trigger: 'onBlur'
  },
  {
    type: 'email',
    message: '请输入有效的邮箱地址',
    trigger: 'onBlur'
  }
];

// 密码验证规则
const passwordRules = [
  {
    required: true,
    message: '请输入密码',
    trigger: 'onBlur'
  },
  {
    min: 6,
    message: '密码长度不能小于6位',
    trigger: 'onBlur'
  },
  {
    max: 30,
    message: '密码长度不能超过30位',
    trigger: 'onBlur'
  },
];

// 确认密码验证规则函数
const getConfirmPasswordRules = (form) => [
  {
    required: true,
    message: '请确认密码',
    trigger: 'onBlur'
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
    },
    trigger: 'onBlur'
  }
];

// 手机号验证规则
const phoneRules = [
  {
    required: true,
    message: '请输入手机号',
    trigger: 'onBlur'
  },
  {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的11位手机号',
    trigger: 'onBlur'
  },
];

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 从 localStorage 获取保存的表单数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('registerFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        form.setFieldsValue({
          email: parsedData.email || '',
          nickName: parsedData.nickName || '',
          country: parsedData.country || '',
          firstName: parsedData.firstName || '',
          lastName: parsedData.lastName || '',
          phone: parsedData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }, []); // 移除form依赖，因为form实例在组件生命周期内是稳定的

  // 保存表单数据到 localStorage（除了密码字段）
  const saveFormData = (values) => {
    const dataToSave = {
      email: values.email,
      nickName: values.nickName,
      country: values.country,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone
    };
    localStorage.setItem('registerFormData', JSON.stringify(dataToSave));
  };

  // 移除独立的验证函数，已经在常量中定义

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 加密密码
      const encryptedPassword = await encrypt(values.password);
      const encryptedConfirmPassword = await encrypt(values.confirmPassword);

      const registerData = {
        ...values,
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword
      };

      const response = await register(registerData);

      if (response.success) {
        // 保存非敏感表单数据
        saveFormData(values);

        // 显示成功消息
        Message.success('注册成功！');

        // 切换到登录页面
        onSwitchToLogin();
      } else {
        // 显示错误消息
        Message.error(response.message || '注册失败');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Message.error(error.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">注册</h2>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        className="auth-form__form"
      >
        <Form.Item
          name="email"
          label="邮箱"
          validateTrigger="onBlur"
          rules={emailRules}
        >
          <Input
            placeholder="请输入邮箱"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          validateTrigger="onBlur"
          rules={passwordRules}
        >
          <Input.Password
            placeholder="请输入密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          validateTrigger="onBlur"
          rules={getConfirmPasswordRules(form)}
        >
          <Input.Password
            placeholder="请再次输入密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="名"
          rules={[
            {
              required: true,
              message: '请输入名'
            }
          ]}
        >
          <Input
            placeholder="请输入名"
            autoComplete="given-name"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="姓"
          rules={[
            {
              required: true,
              message: '请输入姓'
            }
          ]}
        >
          <Input
            placeholder="请输入姓"
            autoComplete="family-name"
          />
        </Form.Item>

        <Form.Item
          name="nickName"
          label="昵称"
        >
          <Input
            placeholder="请输入昵称（选填）"
            autoComplete="nickname"
          />
        </Form.Item>

        <Form.Item
          name="country"
          label="国家/地区"
          rules={[
            {
              required: true,
              message: '请选择国家/地区'
            }
          ]}
        >
          <Select
            placeholder="请选择国家/地区"
            options={COUNTRY_OPTIONS}
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          validateTrigger="onBlur"
          rules={phoneRules}
        >
          <Input
            placeholder="请输入手机号"
            autoComplete="tel"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="auth-form__submit-btn"
            block
          >
            注册
          </Button>
        </Form.Item>

        <div className="login-link">
          已有账号？
          <Button
            type="text"
            onClick={onSwitchToLogin}
            className="login-link-button"
          >
            立即登录
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;
