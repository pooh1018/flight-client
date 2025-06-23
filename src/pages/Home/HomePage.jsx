import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import FlightSearchForm from '@/pages/FlightSearch/components/FlightSearchForm';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearch = (values) => {
    // 将搜索参数转换为URL查询参数
    const queryParams = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // 处理日期数组
        value.forEach((date, index) => {
          queryParams.append(`${key}[${index}]`, date.toISOString());
        });
      } else if (value instanceof Date) {
        // 处理单个日期
        queryParams.append(key, value.toISOString());
      } else {
        // 处理其他值
        queryParams.append(key, value);
      }
    });

    // 导航到搜索页面，带上查询参数
    navigate(`/flightSearch?${queryParams.toString()}`);
  };

  return (
    <div className="home-page">
      <HeroSection />
      <FlightSearchForm onSearch={handleSearch} />
    </div>
  );
};

export default HomePage;
