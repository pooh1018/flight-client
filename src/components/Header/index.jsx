import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInfo } from '../../services/loginApi';
import './index.scss';

// 自定义导航菜单项组件
const NavMenuItem = ({ active, index, onClick, children }) => {
  return (
    <div
      className={`nav-menu-item ${active ? 'active' : ''}`}
      onClick={() => onClick(index)}
    >
      {children}
    </div>
  );
};

// 自定义下拉菜单组件
const CustomDropdown = ({ trigger, children, menu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="custom-dropdown"
      ref={dropdownRef}
      onClick={handleTrigger}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dropdown-trigger">
        {children}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {menu}
        </div>
      )}
    </div>
  );
};

// 下拉菜单项组件
const DropdownItem = ({ icon, onClick, children }) => {
  return (
    <div className="dropdown-item" onClick={onClick}>
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      <span className="dropdown-item-text">{children}</span>
    </div>
  );
};

const Header = ({ onLoginClick, onLogout, user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(location.pathname);
  const [loading, setLoading] = useState(false);

  // 页面刷新时检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      // 如果已经有用户信息，不需要再次获取
      if (user) return;

      setLoading(true);
      try {
        const response = await getInfo();
        if (response.success) {
          // 用户已登录，更新用户信息
          if (setUser) {
            // 确保用户数据格式一致，与MainLayout组件中的处理方式保持一致
            const userData = response.data.user?.user || response.data.user || response.data;
            setUser(userData);
          } else {
            console.warn('setUser function not provided to Header component');
          }
        }
      } catch (error) {
        console.error('Failed to check login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [user, setUser]);

  // 处理滚动事件，添加滚动样式
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // 当路由变化时更新活动菜单项
  useEffect(() => {
    setActiveIndex(location.pathname);
  }, [location.pathname]);

  const handleSelect = (index) => {
    setActiveIndex(index);
    if (index === '/login') {
      onLoginClick();
    } else {
      navigate(index);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
    setActiveIndex('/home');
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

    console.log('Getting avatar text for user:', user); // 添加调试日志

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

    console.log('Generated avatar text:', initials); // 添加调试日志
    return initials;
  };

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <a href="/home" className="logo" onClick={handleLogoClick}>
          航班预订系统
        </a>

        <nav className="nav-menu">
          <NavMenuItem
            active={activeIndex === '/home'}
            index="/home"
            onClick={handleSelect}
          >
            首页
          </NavMenuItem>
          <NavMenuItem
            active={activeIndex === '/flightSearch'}
            index="/flightSearch"
            onClick={handleSelect}
          >
            航班查询
          </NavMenuItem>
          <NavMenuItem
            active={activeIndex === '/my-bookings'}
            index="/my-bookings"
            onClick={handleSelect}
          >
            我的订单
          </NavMenuItem>
        </nav>

        {user ? (
          <CustomDropdown
            trigger="click"
            menu={
              <div className="dropdown-menu-content">
                <DropdownItem
                  icon={<span>👤</span>}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profile');
                  }}
                >
                  个人中心
                </DropdownItem>
                <DropdownItem
                  icon={<span>🚪</span>}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                >
                  退出登录
                </DropdownItem>
              </div>
            }
          >
            <div className="user-avatar" style={{ backgroundColor: getRandomColor() }}>
              {getAvatarText(user)}
            </div>
          </CustomDropdown>
        ) : (
          <button className="login-button" onClick={onLoginClick}>
            登录
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
