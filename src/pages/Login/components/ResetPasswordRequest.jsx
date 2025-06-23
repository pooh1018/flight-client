import React, { useState } from 'react';
import { Form, Input, Button, Message } from '@/components/ui';
import { findByEmail } from "@/services/userApi";
import './AuthForm.css';

const ResetPasswordRequest = ({ onRequestReset, onSwitchToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // 邮箱验证函数
    const validateEmail = (_, value) => {
        if (!value) {
            return Promise.reject('请输入您的邮箱');
        }

        // 更严格的邮箱验证规则
        // 1. 用户名部分：允许字母、数字、下划线、点、连字符和加号
        // 2. 域名部分：允许字母、数字、连字符和点
        // 3. 顶级域名：2-6个字母
        const emailRegex = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(value)) {
            return Promise.reject('请输入有效的邮箱地址');
        }

        return Promise.resolve();
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // 检查邮箱是否存在
            const checkResult = await findByEmail(values.email);

            if (!checkResult.success || !checkResult.data) {
                // 显示错误消息
                Message.error('该邮箱未注册');
                return;
            }

            // 调用父组件提供的请求重置回调
            onRequestReset(values.email);

            // 注意：这里原代码中有注释掉的发送重置密码邮件的逻辑
            // 如果需要，可以取消注释并调整为适合自定义组件的代码
        } catch (error) {
            console.error('重置密码请求错误:', error);

            // 显示错误消息
            Message.error(error.message || '发送重置邮件失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2 className="auth-form__title">忘记密码</h2>
            <p className="auth-form__subtitle">请输入您的注册邮箱，我们将向您发送重置密码的链接</p>

            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                className="auth-form__form"
            >
                <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                        {
                            validator: validateEmail
                        }
                    ]}
                >
                    <Input
                        placeholder="请输入您的注册邮箱"
                        type="email"
                        autoComplete="email"
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
                        发送重置链接
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ResetPasswordRequest;
