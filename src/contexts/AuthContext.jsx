import React from 'react';
import useAuth from '@/hooks/useAuth';

// 创建AuthContext
const AuthContext = React.createContext();

// 创建AuthProvider组件
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// 创建useAuthContext Hook方便使用
export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// 默认导出Context对象
export default AuthContext;
