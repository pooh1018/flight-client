import React, { useState, useEffect, useMemo, memo, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import LoginDialog from '@/pages/Login/LoginDialog';
import Loading from '@/components/Loading';
import { ModalProvider } from '@/contexts/ModalContext';
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
  'settings': '设置',
  'detail': '订单详情',
  'detail-view': '订单确认',
  'success': '预订成功'
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
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

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

  // 移除了handleLoginClick、handleLoginSuccess和handleLogout函数
  // 这些功能现在由useAuth Hook提供

  return (
    <div className="main-layout">
      <ModalProvider>
        <Header />
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
        <LoginDialog />
      </ModalProvider>
    </div>
  );
});

export default MainLayout;
