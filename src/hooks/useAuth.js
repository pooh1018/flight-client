import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInfo, login, logout } from '../services/loginApi';
import { Message } from '@/components/ui/Message';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [pendingFlight, setPendingFlight] = useState(null);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 获取初始认证状态
  const hasToken = !!localStorage.getItem('token');

  // 处理登录成功
  const handleLoginSuccess = async (credentials) => {
    try {
      const response = await login(credentials);
      if (response.success) {
        const { token, user } = response.data.user || response.data;
        localStorage.setItem('token', token);
        setUser(user);
        Message.success('登录成功！');

        // 如果有待处理的航班信息，返回原页面
        const pendingFlight = localStorage.getItem('pendingFlight');
        if (pendingFlight) {
          const flightData = JSON.parse(pendingFlight);
          navigate(-1, { state: { flight: flightData } });
          localStorage.removeItem('pendingFlight');
        } else {
          // 检查是否有保存的原始路由
          const fromRoute = localStorage.getItem('fromRoute');
          if (fromRoute) {
            navigate(fromRoute);
            localStorage.removeItem('fromRoute');
          } else {
            // 默认返回上一页
            navigate(-1);
          }
        }
        return true;
      } else {
        Message.error(response.message || '登录失败，请重试');
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('登录失败，请重试');
      return false;
    }
  };

  const isFetching = useRef(false);

  // 检查登录状态
  const checkLoginStatus = async () => {
    // 如果已经有用户信息，不需要再次获取
    if (user) {
      setInitialAuthChecked(true);
      return;
    }
    // 如果已有请求在进行，直接返回
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    try {
      const response = await getInfo();
      if (response.success) {
        // 用户已登录，更新用户信息
        // 确保用户数据格式一致
        const userData = response.data.user?.user || response.data.user || response.data;
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to check login status:', error);
    } finally {
      isFetching.current = false;
      setLoading(false);
      setInitialAuthChecked(true);
    }
  };

  // 页面刷新时检查登录状态
  useEffect(() => {
    // 如果有token，立即设置初始状态
    if (hasToken) {
      checkLoginStatus();
    } else {
      setInitialAuthChecked(true);
    }
  }, []);

  // 监听登录状态变化
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && pendingFlight) {
      navigate('/booking-confirm', { state: { flight: pendingFlight } });
      setPendingFlight(null);
    }
  }, [user, pendingFlight, navigate]);

  // 登录按钮点击处理
  const handleLoginClick = (state) => {
    const currentState = state || location.state;
    if (currentState?.from === 'flightCard') {
      localStorage.setItem('pendingFlight', JSON.stringify(currentState.flight));
    } else {
      // 保存当前路由路径
      localStorage.setItem('fromRoute', location.pathname);
    }
    navigate('/login', { state: currentState });
  };

  // 登出处理
  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    setUser(null);
    navigate('/home');
  };

  // 生成随机颜色
  const getRandomColor = () => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fadb14', '#a0d911', '#fa541c'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 获取用户头像显示文本
  const getAvatarText = (user) => {

    if (!user) return '';

    // 安全地获取首字母
    let initials = '';

    // 尝试从firstName和lastName获取首字母
    if (user.firstName && typeof user.firstName === 'string') {
      initials += user.firstName.charAt(0).toUpperCase();
    }

    if (user.lastName && typeof user.lastName === 'string') {
      initials += user.lastName.charAt(0).toUpperCase();
    }

    // 如果没有firstName和lastName，尝试从username获取
    if (!initials && user.username && typeof user.username === 'string') {
      initials = user.username.charAt(0).toUpperCase();
    }

    // 如果没有username，尝试从email获取
    if (!initials && user.email && typeof user.email === 'string') {
      initials = user.email.charAt(0).toUpperCase();
    }

    // 如果所有尝试都失败，使用默认值
    if (!initials) {
      initials = 'U';
    }

    return initials;
  };

  return {
    user,
    setUser,
    loading,
    loginVisible,
    setLoginVisible,
    checkLoginStatus,
    handleLoginSuccess,
    handleLogout,
    getRandomColor,
    getAvatarText,
    pendingFlight,
    setPendingFlight,
    isAuthenticated: !!user // 添加 isAuthenticated 属性
  };
}
