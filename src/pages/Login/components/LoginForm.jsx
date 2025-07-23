import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox } from '@/components/ui';
import { WechatOutlined } from '@ant-design/icons';
import { encrypt } from "@/utils/rsaEncrypt";
import './AuthForm.css';

// 邮箱验证规则
const emailRules = [
  {
    required: true,
    message: '请输入邮箱',
    trigger: ['onBlur', 'onChange', 'onSubmit']
  },
  {
    type: 'email',
    message: '请输入有效的邮箱地址',
    trigger: ['onBlur', 'onChange', 'onSubmit']
  }
];

// 密码验证规则
const passwordRules = [
  {
    required: true,
    message: '请输入密码',
    trigger: ['onBlur', 'onChange', 'onSubmit']
  },
  {
    min: 6,
    message: '密码长度不能小于6位',
    trigger: ['onBlur', 'onChange', 'onSubmit']
  },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
    message: '密码必须包含大小写字母和数字，长度6-20位',
    trigger: ['onBlur', 'onChange', 'onSubmit']
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

  const handleSubmit = async (values) => {
    try {
      // 严格验证所有字段
      await formInstance.validateFields(['username', 'password']);

      // 检查字段是否为空
      if (!values.username || !values.password) {
        throw new Error('用户名或密码不能为空');
      }

      console.log('表单验证通过:', values);

      setLoading(true);

      // 确保值是字符串类型
      const username = values.username || '';
      const password = values.password || '';

      // 处理"记住我"功能
      if (values.rememberMe) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }

      // 准备加密的登录数据
      const credentials = {
        email: username,
        password: encrypt(password)
      };

      // 调用父组件传入的onLogin回调，并根据返回结果决定是否继续
      const loginSuccess = await onLogin(credentials);
      if (!loginSuccess) {
        // 登录失败时不关闭对话框，只清空密码字段
        formInstance.setFieldValue('password', '');
        return;
      }
    } catch (error) {
      console.error("登录错误:", error);
      // 添加密码输入框抖动效果
      const passwordInput = document.querySelector('.password-input');
      if (passwordInput) {
        passwordInput.classList.add('shake-animation');
        setTimeout(() => {
          passwordInput.classList.remove('shake-animation');
        }, 500);
      }
      // 清空密码字段
      formInstance.setFieldValue('password', '');
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
        onFinishFailed={({ errorFields }) => {
          console.log('表单验证失败:', errorFields);
          // 添加错误提示动画
          errorFields.forEach(({ name }) => {
            const input = document.querySelector(`[name="${name}"]`);
            if (input) {
              input.classList.add('shake-animation');
              setTimeout(() => {
                input.classList.remove('shake-animation');
              }, 500);
            }
          });
        }}
      >
        <Form.Item
          label="邮箱"
          name="username"
          rules={emailRules}
        >
          <Input
            placeholder="请输入邮箱"
            autoComplete="username"
            className="username-input"
          />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={passwordRules}
        >
          <Input.Password
            placeholder="请输入密码"
            autoComplete="current-password"
            className="password-input"
          />
        </Form.Item>

        <div className="auth-form__options">
          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>
              记住我
            </Checkbox>
          </Form.Item>
          <Button
            type="text"
            onClick={onForgotPassword}
            className="forgot-password"
          >
            忘记密码？
          </Button>
        </div>

        <Form.Item>
          <Button
            type="primary"
            loading={loading}
            htmlType="submit"
            block
            className="auth-form__submit-btn"
          >
            登录
          </Button>
        </Form.Item>

        <div className="auth-form__divider">
          <span className="divider-line"></span>
          <span className="divider-text">或</span>
          <span className="divider-line"></span>
        </div>

        <Form.Item>
          <Button
            icon={<WechatOutlined />}
            onClick={() => onForgotPassword('wechat')}
            block
            className="auth-form__wechat-btn"
          >
            微信登录
          </Button>
        </Form.Item>

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
