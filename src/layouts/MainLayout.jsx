import React, { useState, useEffect, useMemo, memo, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import LoginDialog from '@/pages/Login/LoginDialog';
import { logout } from '@/services/loginApi';
import { getUserInfo, removeAuthToken, removeUserInfo } from '@/utils/storage';
import Loading from '@/components/Loading';
import './MainLayout.scss';

// 路径到标题的映射配置
const PATH_TO_TITLE = {
  'home': '首页',
  'flights': '航班查询',
  'flightSearch': '航班搜索',
  'booking': '机票预订',
  'orders': '订单管理',
  'my-bookings': '我的预订',
  'login': '登录',
  'flightlist': '航班列表',
  'profile': '个人中心',
  'settings': '设置'
};

// 将路径转换为可读的标题
const getTitleFromPath = (path) => {
  return PATH_TO_TITLE[path] || path.charAt(0).toUpperCase() + path.slice(1);
};

// 内容加载组件
const ContentLoader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // 短暂的加载时间，以确保平滑过渡

    return () => clearTimeout(timer);
  }, [children]);

  return (
    <div className={`content-wrapper ${isLoading ? 'loading' : 'loaded'}`}>
      {isLoading ? (
        <div className="content-loading">
          <Loading />
        </div>
      ) : (
        children
      )}
    </div>

  );
};

const MainLayout = memo(({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginVisible, setLoginVisible] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = getUserInfo();
    return savedUser || null;
  });

  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // 使用useMemo缓存面包屑项的计算结果
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [];

    // 总是添加首页
    items.push({
      title: '首页',
      link: '/home'
    });

    // 根据路径生成面包屑
    let currentPath = '';
    pathSegments.forEach((segment) => {
      if (segment !== 'home') {  // 跳过 home 路径，因为已经添加了首页
        currentPath += `/${segment}`;
        items.push({
          title: getTitleFromPath(segment),
          link: currentPath
        });
      }
    });

    return items;
  }, [location.pathname]);

  const handleLoginClick = () => {
    setLoginVisible(true);
  };

  const handleLoginSuccess = (userData) => {
    // 正确提取嵌套的用户数据
    const userInfo = userData.user?.user || userData.user || userData;
    setUser(userInfo);
    setLoginVisible(false);
  };

  const handleLogout = async () => {
    try {
      // 调用logout API
      await logout();

      // 清除所有本地状态
      removeAuthToken();
      removeUserInfo();
      localStorage.removeItem('user');
      setUser(null);

      // 显示成功提示
      toast.success('退出登录成功');

      // 获取当前路径
      const currentPath = location.pathname;
      // 如果不在首页或航班查询页面，则跳转到首页
      if (currentPath !== '/' && currentPath !== '/home' && currentPath !== '/flightSearch') {
        navigate('/home');
      } else {
        // 如果已经在首页或航班查询页面，强制刷新页面以更新UI状态
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('退出登录失败，请重试');
    }
  };

  // 使用useMemo缓存Header组件的props
  const headerProps = useMemo(() => ({
    user,
    setUser,
    onLoginClick: handleLoginClick,
    onLogout: handleLogout
  }), [user, setUser]);

  return (
    <div className="main-layout">
      <Header {...headerProps} />
      <div className="main-content">
        {!isHomePage && (
          <div className="breadcrumb-container">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        <div className="content-container">
          <Suspense fallback={<Loading />}>
            <ContentLoader>
              {children}
            </ContentLoader>
          </Suspense>
        </div>
      </div>
      <LoginDialog
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
});

export default MainLayout;
