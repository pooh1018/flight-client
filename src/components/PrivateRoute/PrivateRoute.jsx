import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * 私有路由组件，用于保护需要登录才能访问的路由
 * 如果用户已登录，则渲染子组件
 * 如果用户未登录，则显示登录对话框并重定向到首页
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, setLoginVisible } = useAuthContext();
  const location = useLocation();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!checkedAuth) {
      if (!isAuthenticated) {
        setLoginVisible(true);
      }
      setCheckedAuth(true);
    }
  }, [isAuthenticated, setLoginVisible, checkedAuth]);

  if (!checkedAuth) {
    // 等待认证检查完成
    return null;
  }

  if (!isAuthenticated) {
    // 重定向到首页，并传递当前位置信息
    return <Navigate to="/home" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;
