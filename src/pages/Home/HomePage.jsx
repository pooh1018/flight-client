import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import FlightSearchForm from '@/pages/FlightSearch/components/FlightSearchForm';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearch = (values) => {
    // 保存表单数据到localStorage
    try {
      // 处理日期对象，将其转换为ISO字符串
      const searchData = {
        ...values,
        departureDate: values.departureDate ? values.departureDate.toISOString() : null,
        returnDate: values.returnDate ? values.returnDate.toISOString() : null,
      };
      
      // 保存城市信息，如果存在
      if (values.cities) {
        searchData.cities = values.cities;
      }
      
      // 保存搜索参数到localStorage
      localStorage.setItem('flightSearchParams', JSON.stringify(searchData));
      
      // 设置一个标志，表示这是一个新的搜索
      localStorage.setItem('isNewSearch', 'true');
      
      console.log('搜索参数已保存到localStorage:', searchData);
    } catch (error) {
      console.error('保存搜索数据到localStorage时出错:', error);
    }

    // 直接导航到搜索页面，不带查询参数
    navigate('/flightSearch', {
      state: { fromHomePage: true }
    });
  };

  return (
    <div className="home-page">
      <HeroSection />
      <FlightSearchForm onSearch={handleSearch} />
    </div>
  );
};

export default HomePage;
