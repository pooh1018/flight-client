import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
import './components/AuthForm.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordRequest from './components/ResetPasswordRequest';
import ResetPasswordForm from './components/ResetPasswordForm';

const LoginDialog = () => {
    const { loginVisible, setLoginVisible, handleLoginSuccess } = useAuthContext();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showResetRequest, setShowResetRequest] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    // Reset states when dialog opens
    useEffect(() => {
        if (loginVisible) {
            setIsLogin(true);
            setShowResetRequest(false);
            setShowResetForm(false);
            setResetEmail('');
        }
    }, [loginVisible]);

    const handleLogin = async (credentials) => {
        const success = await handleLoginSuccess(credentials);
        if (success) {
            setLoginVisible(false);
        }
    };

    const handleRegister = async (data) => {
        // TODO: Implement registration logic
        setIsLogin(true);
    };

    const handleRequestReset = (email) => {
        setResetEmail(email);
        setShowResetForm(true);
        setShowResetRequest(false);
    };

    const handleResetPassword = async (data) => {
        // TODO: Implement password reset logic
        setShowResetForm(false);
        setIsLogin(true);
    };

    const getDialogTitle = () => {
        if (showResetForm) return "重置密码";
        if (showResetRequest) return "忘记密码";
        if (!isLogin) return "创建账号";
        return "登录账号";
    };

    return (
        <Modal
            title={getDialogTitle()}
            visible={loginVisible}
            onClose={() => setLoginVisible(false)}
            width="480px"
            className="auth-dialog"
        >
            {showResetForm ? (
                <ResetPasswordForm
                    onResetPassword={handleResetPassword}
                    onSwitchToLogin={() => {
                        setShowResetForm(false);
                        setIsLogin(true);
                    }}
                    email={resetEmail}
                />
            ) : showResetRequest ? (
                <ResetPasswordRequest
                    onRequestReset={handleRequestReset}
                    onSwitchToLogin={() => {
                        setShowResetRequest(false);
                        setIsLogin(true);
                        setResetEmail('');
                    }}
                />
            ) : isLogin ? (
                <LoginForm
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setIsLogin(false)}
                    onForgotPassword={() => setShowResetRequest(true)}
                />
            ) : (
                <RegisterForm
                    onRegister={handleRegister}
                    onSwitchToLogin={() => setIsLogin(true)}
                />
            )}
        </Modal>
    );
};

export default LoginDialog;
