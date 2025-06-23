import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    handleLoginClick = () => {
      setLoginVisible(true);
    },
    handleLogout,
    getRandomColor,
    getAvatarText,
    pendingFlight,
    setPendingFlight,
    setLoginVisible
  } = useAuthContext();

  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(location.pathname);

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
      const { state } = location;
      handleLoginClick(state);
    } else {
      navigate(index);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
    setActiveIndex('/home');
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
                    handleLogout();
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
          <button className="login-button" onClick={() => handleLoginClick()}>
            登录
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
