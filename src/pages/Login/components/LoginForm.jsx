import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Message, FormItem } from '@/components/ui';
import { encrypt } from "@/utils/rsaEncrypt";
import { login } from "@/services/loginApi";
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
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
    message: '密码必须包含大小写字母和数字，长度6-20位',
    trigger: 'onBlur'
  },
];

const LoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [loading, setLoading] = useState(false);
  const [formInstance] = Form.useForm();

  useEffect(() => {
    // 从localStorage获取保存的用户名、密码和记住我状态
    const savedUsername = localStorage.getItem('username') || '';
    const savedPassword = localStorage.getItem('password') || '';
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    // 分别设置每个字段的值
    formInstance.setFieldValue('username', savedUsername);
    formInstance.setFieldValue('password', rememberMe ? savedPassword : ''); // 只有在"记住我"为true时才填充密码
    formInstance.setFieldValue('rememberMe', rememberMe); // 设置记住我状态
  }, []); // 移除formInstance依赖，只在组件挂载时执行一次

  // 移除未使用的验证函数，已经在常量中定义

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // 确保值是字符串类型
      const username = values.username || '';
      const password = values.password || '';

      const data = {
        email: username,
        password: encrypt(password)
      };

      // 保存用户名、密码和记住我状态
      if (values.rememberMe) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password); // 保存密码到localStorage
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('username');
        localStorage.removeItem('password'); // 移除保存的密码
        localStorage.removeItem('rememberMe');
      }

      const response = await login(data);

      // 如果登录成功，保存token到localStorage
      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);

        // 显示成功消息
        Message.success('登录成功，欢迎回来！');
        onLogin(response.data);
      } else {
        const errorMessage = response?.message || '登录失败，请重试';
        Message.error(errorMessage);

        // 清空密码字段并显示错误
        formInstance.setFieldValue('password', '');
        // 设置错误信息
        if (errorMessage) {
          formInstance.setFields([{ name: 'password', errors: [errorMessage] }]);
        }
      }
    } catch (error) {
      console.error("登录错误:", error);
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请重试';

      // 显示错误消息
      Message.error(errorMessage);

      // 设置表单错误
      if (error.response?.status === 401) {
        // 认证错误，清空密码并显示错误
        formInstance.setFieldValue('password', '');
        formInstance.setFields([{ name: 'password', errors: ['用户名或密码错误'] }]);
      } else {
        // 其他错误，显示在密码字段下
        formInstance.setFields([{ name: 'password', errors: [errorMessage] }]);
      }

      // 添加密码输入框抖动效果
      const passwordInput = document.querySelector('.password-input');
      if (passwordInput) {
        passwordInput.classList.add('shake-animation');
        setTimeout(() => {
          passwordInput.classList.remove('shake-animation');
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">登录</h2>
      <Form
        form={formInstance}
        layout="vertical"
        className="auth-form__form"
        onFinish={handleSubmit}
      >
        <FormItem
          label="邮箱"
          name="username"
          rules={emailRules}
        >
          <Input
            placeholder="请输入邮箱"
            autoComplete="username"
            className="username-input"
          />
        </FormItem>

        <FormItem
          label="密码"
          name="password"
          rules={passwordRules}
        >
          <Input.Password
            placeholder="请输入密码"
            autoComplete="current-password"
            className="password-input"
          />
        </FormItem>

        <div className="auth-form__options">
          <FormItem name="rememberMe" valuePropName="checked">
            <Checkbox>
              记住我
            </Checkbox>
          </FormItem>
          <Button
            type="text"
            onClick={onForgotPassword}
            className="forgot-password"
          >
            忘记密码？
          </Button>
        </div>

        <FormItem>
          <Button
            type="primary"
            loading={loading}
            htmlType="submit"
            block
            className="auth-form__submit-btn"
          >
            登录
          </Button>
        </FormItem>

        <div className="login-link">
          还没有账号？
          <Button
            type="text"
            onClick={onSwitchToRegister}
            className="register-link"
          >
            立即注册
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
