import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Message } from '@/components/ui/Message';
import { Tabs, TabPane } from '@/components/ui/Tabs';
import FlightSearchForm from './components/FlightSearchForm';
import FlightList from './components/FlightList/index';
import FlightFilters from './components/FlightFilters';
import flightApi from '@/services/flightApi';
import { getSearchHistory, saveSearchHistory } from '@/utils/storage';
import { formatInTimeZone } from 'date-fns-tz';
import { formatDate } from '@/utils/formatters';
import './index.scss';
import {useAuthContext} from "@/contexts/AuthContext";

/**
 * 航班搜索页面
 * @returns {JSX.Element} 航班搜索页面组件
 */
const FlightSearch = ({ onLoginClick = () => {} }) => {
  const navigate = useNavigate();
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const searchSectionRef = useRef(null);
  const lastScrollY = useRef(0);
  const { user } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      if (!searchSectionRef.current) return;

      const searchSection = searchSectionRef.current;
      const searchSectionHeight = searchSection.offsetHeight;
      const scrollPosition = window.scrollY;
      const shouldCollapse = scrollPosition > searchSectionHeight / 2;

      // Only update state if needed to avoid unnecessary re-renders
      if (shouldCollapse !== isSearchCollapsed) {
        setIsSearchCollapsed(shouldCollapse);
      }
      lastScrollY.current = scrollPosition;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchCollapsed]);
  const location = useLocation();
  // 搜索参数
  const [searchParams, setSearchParams] = useState(null);
  // 航班列表
  const [cities, setCities] = useState([]); // 存储城市和机场数据
  const [flights, setFlights] = useState({
    outbound: [],
    inbound: []
  });
  // 过滤后的航班列表
  const [filteredFlights, setFilteredFlights] = useState({
    outbound: [],
    inbound: []
  });
  // 过滤条件
  const [filters, setFilters] = useState({});
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 分页相关状态
  const [pagination, setPagination] = useState({
    outbound: {
      current: 0,
      pageSize: 10,
      total: 0
    },
    inbound: {
      current: 0,
      pageSize: 10,
      total: 0
    }
  });
  // 是否已执行搜索
  const [hasSearched, setHasSearched] = useState(false);
  // 当前活动标签（往返航班时使用）
  const [activeTab, setActiveTab] = useState('outbound');

  // 标记是否已经执行过自动搜索
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  // 从localStorage和搜索历史中获取搜索条件
  useEffect(() => {
    try {
      // 首先尝试从localStorage中获取最新的搜索参数
      const searchParamsData = localStorage.getItem('flightSearchParams');
      const isNewSearch = localStorage.getItem('isNewSearch') === 'true';

      if (searchParamsData) {
        const parsedParams = JSON.parse(searchParamsData);

        // 处理日期字符串，转换为Date对象
        const params = {
          ...parsedParams,
          departureDate: parsedParams.departureDate ? new Date(parsedParams.departureDate) : null,
          returnDate: parsedParams.returnDate ? new Date(parsedParams.returnDate) : null
        };

        setSearchParams(params);

        // 如果是新搜索且未自动搜索过，则触发搜索
        if (isNewSearch && !hasAutoSearched) {
          console.log('执行新搜索:', params);
          handleSearch(params.cities ? { cities: params.cities, ...params } : params);
          setHasAutoSearched(true); // 标记已执行过自动搜索
          localStorage.setItem('isNewSearch', 'false'); // 重置新搜索标志
        }
      } else {
        // 如果localStorage中没有数据，尝试使用上次搜索记录
        const lastSearch = getSearchHistory()[0];
        if (lastSearch) {
          setSearchParams(lastSearch);
        }
      }
    } catch (error) {
      console.error('从localStorage恢复搜索数据时出错:', error);
      // 如果解析失败，尝试使用上次搜索记录
      const lastSearch = getSearchHistory()[0];
      if (lastSearch) {
        setSearchParams(lastSearch);
      }
    }
  }, [location.state]); // state变化时重新执行

  /**
   * 搜索航班
   * @param {Object} params - 搜索参数
   * @param {number} page - 页码，从0开始
   * @param {number} size - 每页条数
   */
  const handleSearch = async ({ cities: newCities, ...params }, page = 0, size = 10) => {
    // 更新城市数据
    if (newCities) {
      setCities(newCities);
    }
    setLoading(true);
    setSearchParams(params);
    setHasSearched(true);
    setFilters({}); // 重置过滤条件
    setActiveTab('outbound'); // 重置活动标签为去程

    // 清空已选择的航班和舱位信息
    setSelectedFlights({
      outbound: null,
      inbound: null
    });
    setSelectedCabins({
      outbound: null,
      inbound: null
    });

    try {
      // 保存搜索参数到localStorage
      const searchParamsToSave = {
        ...params,
        departureDate: params.departureDate instanceof Date
          ? params.departureDate.toISOString()
          : params.departureDate,
        returnDate: params.returnDate instanceof Date
          ? params.returnDate.toISOString()
          : params.returnDate
      };
      localStorage.setItem('flightSearchParams', JSON.stringify(searchParamsToSave));
      localStorage.setItem('isNewSearch', 'false');

      // 保存搜索历史
      saveSearchHistory(params);

      // 获取用户当地时区
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // 验证并格式化日期
      let departureDateWithZone = null;
      let returnDateWithZone = null;

      try {
        // 验证并处理出发日期
        if (params.departureDate) {
          // 确保日期对象是有效的
          const departureDate = params.departureDate instanceof Date
            ? params.departureDate
            : new Date(params.departureDate);

          if (isNaN(departureDate.getTime())) {
            throw new Error('Invalid departure date');
          }

          // 重置时间部分为当天的00:00:00
          departureDate.setHours(0, 0, 0, 0);
          departureDateWithZone = formatInTimeZone(departureDate, userTimeZone, 'yyyy-MM-dd');
        }

        // 验证并处理返程日期（如果是往返航班）
        if (params.tripType === 'roundtrip' && params.returnDate) {
          // 确保日期对象是有效的
          const returnDate = params.returnDate instanceof Date
            ? params.returnDate
            : new Date(params.returnDate);

          if (isNaN(returnDate.getTime())) {
            throw new Error('Invalid return date');
          }

          // 重置时间部分为当天的00:00:00
          returnDate.setHours(0, 0, 0, 0);
          returnDateWithZone = formatInTimeZone(returnDate, userTimeZone, 'yyyy-MM-dd');
        }
      } catch (error) {
        console.error('日期格式化错误:', error);
        Message.error('日期格式无效，请重新选择日期');
        setLoading(false);
        return;
      }

      // 构建API所需的最小参数集
      const searchParams = {
        departureAirportId: params.departureAirportId,
        arrivalAirportId: params.arrivalAirportId,
        startDate: params.departureDate.toISOString(),
        returnDate: returnDateWithZone || null,
        page: 0,  // 确保从第一页开始
        size: size || 10
      };

      const response = await flightApi.searchFlights(searchParams);

      if (response.success) {
        // console.log("params.tripType>>>>>>", params.tripType);
        // 处理往返航班和单程航班的不同数据结构
        if (params.tripType === 'roundtrip') {
          // 更新航班数据
          setFlights({
            outbound: response.data.outbound?.content || [],
            inbound: response.data.inbound?.content || []
          });
          setFilteredFlights({
            outbound: response.data.outbound?.content || [],
            inbound: response.data.inbound?.content || []
          });

          // 更新分页信息
          setPagination({
            outbound: {
              current: response.data.outbound?.pageable?.pageNumber || 0,
              pageSize: response.data.outbound?.pageable?.pageSize || 10,
              total: response.data.outbound?.totalElements || 0
            },
            inbound: {
              current: response.data.inbound?.pageable?.pageNumber || 0,
              pageSize: response.data.inbound?.pageable?.pageSize || 10,
              total: response.data.inbound?.totalElements || 0
            }
          });

          if ((!response.data.outbound || response.data.outbound.content.length === 0) &&
              (!response.data.inbound || response.data.inbound.content.length === 0)) {
            Message.info('未找到符合条件的航班，请尝试其他日期或航线');
          }
        } else {
          // 单程航班
          const flightData = response.data?.content || [];
          setFlights({
            outbound: flightData,
            inbound: []
          });
          setFilteredFlights({
            outbound: flightData,
            inbound: []
          });

          // 更新分页信息
          setPagination({
            outbound: {
              current: response.data?.pageable?.pageNumber || 0,
              pageSize: response.data?.pageable?.pageSize || 10,
              total: response.data?.totalElements || 0
            },
            inbound: {
              current: 0,
              pageSize: 10,
              total: 0
            }
          });

          if (flightData.length === 0) {
            Message.info('未找到符合条件的航班，请尝试其他日期或航线');
          }
        }
      } else {
        Message.error(response.message || '搜索航班失败');
      }
    } catch (error) {
      console.error('搜索航班出错:', error);
      Message.error('搜索航班时发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理页码变化
   * @param {number} page - 新页码，从0开始
   */
  const handlePageChange = (page) => {
    if (!searchParams) return;

    // 更新当前活动标签的页码
    setPagination(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        current: page
      }
    }));

    // 重新搜索航班
    handleSearch(searchParams, page, pagination[activeTab].pageSize);
  };

  /**
   * 处理每页条数变化
   * @param {number} size - 新的每页条数
   */
  const handlePageSizeChange = (size) => {
    if (!searchParams) return;

    // 获取当前页码
    const currentPage = pagination[activeTab].current;

    // 计算新的总页数
    const totalItems = pagination[activeTab].total;
    const newTotalPages = Math.ceil(totalItems / size);

    // 如果当前页码超出新的总页数，则调整到最后一页
    // 否则保持当前页码不变
    const newCurrentPage = currentPage >= newTotalPages && newTotalPages > 0
      ? newTotalPages - 1  // API使用从0开始的页码
      : currentPage;

    // 更新当前活动标签的每页条数和页码
    setPagination(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        pageSize: size,
        current: newCurrentPage
      }
    }));

    // 重新搜索航班，使用调整后的页码
    handleSearch(searchParams, newCurrentPage, size);
  };

  /**
   * 处理过滤条件变化
   * @param {Object} newFilters - 新的过滤条件
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // 应用过滤条件到当前活动标签的航班
    const currentFlights = activeTab === 'outbound' ? flights.outbound : flights.inbound;
    let filtered = [...currentFlights];

    // 航空公司过滤
    if (newFilters.airlines && newFilters.airlines.length > 0) {
      filtered = filtered.filter(flight =>
        newFilters.airlines.includes(flight.airline.code)
      );
    }

    // 价格范围过滤
    if (newFilters.priceRange) {
      const [min, max] = newFilters.priceRange;
      filtered = filtered.filter(flight =>
        flight.price >= min && flight.price <= max
      );
    }

    // 出发时间过滤
    if (newFilters.departureTime && newFilters.departureTime.length > 0) {
      filtered = filtered.filter(flight => {
        const hour = new Date(flight.departureTime).getHours();
        return newFilters.departureTime.some(slot => {
          switch (slot) {
            case 'dawn':
              return hour >= 0 && hour < 6;
            case 'morning':
              return hour >= 6 && hour < 12;
            case 'afternoon':
              return hour >= 12 && hour < 18;
            case 'evening':
              return hour >= 18 && hour < 24;
            default:
              return false;
          }
        });
      });
    }

    // 到达时间过滤
    if (newFilters.arrivalTime && newFilters.arrivalTime.length > 0) {
      filtered = filtered.filter(flight => {
        const hour = new Date(flight.arrivalTime).getHours();
        return newFilters.arrivalTime.some(slot => {
          switch (slot) {
            case 'dawn':
              return hour >= 0 && hour < 6;
            case 'morning':
              return hour >= 6 && hour < 12;
            case 'afternoon':
              return hour >= 12 && hour < 18;
            case 'evening':
              return hour >= 18 && hour < 24;
            default:
              return false;
          }
        });
      });
    }

    // 经停次数过滤
    if (newFilters.stops && newFilters.stops.length > 0) {
      filtered = filtered.filter(flight => {
        const stopCount = flight.stops ? flight.stops.length : 0;
        return newFilters.stops.some(stop => {
          switch (stop) {
            case '0':
              return stopCount === 0;
            case '1':
              return stopCount === 1;
            case '2+':
              return stopCount >= 2;
            default:
              return false;
          }
        });
      });
    }

    // 舱位等级过滤
    if (newFilters.cabinClass) {
      filtered = filtered.filter(flight =>
        flight.cabinClass === newFilters.cabinClass
      );
    }

    // 更新过滤后的航班列表，只更新当前活动标签的航班
    setFilteredFlights(prev => ({
      ...prev,
      [activeTab]: filtered
    }));
  };

  /**
   * 重置过滤条件
   */
  const handleFilterReset = () => {
    setFilters({});
    setFilteredFlights(prev => ({
      ...prev,
      [activeTab]: flights[activeTab]
    }));
  };

  /**
   * 处理标签切换
   * @param {string} tab - 标签名称
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 切换标签时重新应用过滤条件
    if (Object.keys(filters).length > 0) {
      handleFilterChange(filters);
    }
  };

  /**
   * 选择航班
   * @param {Object} flight - 选中的航班
   */
  // 选中的航班信息
  const [selectedFlights, setSelectedFlights] = useState({
    outbound: null,
    inbound: null
  });

  // 选中的舱位信息
  const [selectedCabins, setSelectedCabins] = useState({
    outbound: null,
    inbound: null
  });

  // 处理登录返回后的航班信息恢复
  useEffect(() => {
    if (location.state?.flight) {
      setSelectedFlight(location.state.flight);
    }
  }, [location.state]);
  const [loginSource, setLoginSource] = useState(null);

  const handleLoginClick = (params) => {
    setLoginSource(params.from);
    setSelectedFlight({
      flightId: params.flightId,
      departure: params.departure,
      arrival: params.arrival,
      date: params.date,
      price: params.price,
      hasCabins: params.hasCabins,
      selectedCabinId: params.selectedCabinId
    });
    // 触发Header组件的登录逻辑
    if (onLoginClick) {
      onLoginClick({
        from: 'flightCard',
        flight: {
          id: params.flightId,
          departure: params.departure,
          arrival: params.arrival,
          date: params.date,
          price: params.price,
          cabins: params.hasCabins ? [{ id: params.selectedCabinId }] : [],
          selectedCabinId: params.selectedCabinId
        }
      });
    }
  };

  /**
   * 处理航班和舱位选择
   * @param {Object} flight - 选中的航班
   * @param {string} type - 航班类型 (outbound/inbound)
   * @param {Object} cabin - 选中的舱位 (可选)
   */
  const handleFlightSelect = (flight, type, cabin = null) => {
    const isLoggedIn = localStorage.getItem('token');

    // 更新选中的航班
    setSelectedFlights(prev => ({
      ...prev,
      [type]: flight
    }));

    // 更新选中的舱位
    if (cabin) {
      setSelectedCabins(prev => ({
        ...prev,
        [type]: cabin
      }));
    } else {
      // 如果没有选择舱位，清除之前选择的舱位
      setSelectedCabins(prev => ({
        ...prev,
        [type]: null
      }));
    }

    // 如果未登录，处理登录逻辑
    if (!isLoggedIn && cabin) {
      handleLoginClick({
        from: 'flightCard',
        flightId: flight.id,
        departure: flight.departure,
        arrival: flight.arrival,
        date: flight.date,
        price: cabin ? cabin.price : flight.price,
        hasCabins: true,
        selectedCabinId: cabin.id
      });
      return;
    }

    // 已登录且选择了舱位，如果是单程或已选择两个航班的舱位，可以跳转到预订确认页面
    if (isLoggedIn && cabin) {
      const isComplete = !isRoundTrip || (selectedCabins.outbound && selectedCabins.inbound);
      if (isComplete) {
        // 这里可以添加跳转到预订确认页面的逻辑
        // navigate('/booking/confirm', {
        //   state: {
        //     outbound: { flight: selectedFlights.outbound, cabin: selectedCabins.outbound },
        //     inbound: isRoundTrip ? { flight: selectedFlights.inbound, cabin: selectedCabins.inbound } : null
        //   }
        // });
      }
    }
  };

  // 当前显示的航班列表
  const currentFlights = filteredFlights[activeTab] || [];
  // 是否为往返航班
  const isRoundTrip = searchParams?.tripType === 'roundtrip';

  return (
    <div className="flight-search-page">
      <div className="content-wrapper">
        {/* 搜索表单区域 */}
        <div
          className="search-section"
          ref={searchSectionRef}
          style={{
            transition: 'all 0.3s ease',
            maxHeight: isSearchCollapsed ? '0' : 'none',
            overflow: isSearchCollapsed ? 'hidden' : 'visible'
          }}
        >
          <h2 className="section-title">航班搜索</h2>
          <FlightSearchForm
            initialValues={searchParams}
            onSearch={handleSearch}
          />
        </div>

        {/* 搜索结果区域 */}
        {hasSearched && (
          <div className="main-content">
            {/* 过滤器侧边栏 */}
            {/*<div className="filters-sidebar">*/}
            {/*  <FlightFilters*/}
            {/*    flights={flights[activeTab]}*/}
            {/*    filters={filters}*/}
            {/*    onFilterChange={handleFilterChange}*/}
            {/*    onReset={handleFilterReset}*/}
            {/*  />*/}
            {/*</div>*/}

            {/* 航班列表区域 */}
            <div className="flights-container">
              {/* 预订按钮 - 在往返模式下需要选择两个航班，单程模式下只需选择一个航班 */}
              {((isRoundTrip && selectedFlights.outbound && selectedCabins.outbound &&
                selectedFlights.inbound && selectedCabins.inbound) ||
                (!isRoundTrip && selectedFlights.outbound && selectedCabins.outbound)) && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '15px'
                }}>
                  <button
                    className="book-now-button"
                    style={{
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    onClick={() => {
                      // 计算总价
                      const totalPrice = (selectedCabins.outbound?.price || 0) +
                                        (isRoundTrip ? (selectedCabins.inbound?.price || 0) : 0);

                      // 构建预订信息
                      const bookingInfo = {
                        outbound: {
                          flight: selectedFlights.outbound,
                          cabin: selectedCabins.outbound
                        },
                        inbound: isRoundTrip ? {
                          flight: selectedFlights.inbound,
                          cabin: selectedCabins.inbound
                        } : null,
                        totalPrice: totalPrice,
                        isRoundTrip: isRoundTrip
                      };

                      // 这里可以添加导航到订单页面的逻辑
                      console.log('预订信息:', bookingInfo);
                      Message.success('即将跳转到订单页面...');

                      // 获取去程航班信息
                      const outboundFlight = selectedFlights.outbound;
                      const outboundCabin = selectedCabins.outbound;

                      // 已登录且选择了仓位，跳转到预定确认页
                      navigate('/my-bookings/detail', {
                        state: {
                          flightInfo: {
                            flightId: outboundFlight.id,
                            departure: outboundFlight.departureCity,
                            arrival: outboundFlight.arrivalCity,
                            departureLabel: outboundFlight.departureAirport,
                            arrivalLabel: outboundFlight.arrivalAirport,
                            date: outboundFlight.departureTime,
                            hasCabins: outboundFlight.cabins && outboundFlight.cabins.length > 0,
                            CabinsClass: outboundCabin,
                            user: user,
                            airline: outboundFlight.airline,
                            flightNumber: outboundFlight.flightNumber,
                            departureTime: outboundFlight.departureTime ? formatDate(outboundFlight.departureTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
                            arrivalTime: outboundFlight.arrivalTime ? formatDate(outboundFlight.arrivalTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
                            duration: outboundFlight.duration
                          },
                          // 如果是往返航班且已选择回程航班，添加回程航班信息
                          inboundFlight: isRoundTrip && selectedFlights.inbound && selectedCabins.inbound ? {
                            flightId: selectedFlights.inbound.id,
                            departure: selectedFlights.inbound.departureCity,
                            arrival: selectedFlights.inbound.arrivalCity,
                            departureLabel: selectedFlights.inbound.departureAirport,
                            arrivalLabel: selectedFlights.inbound.arrivalAirport,
                            date: selectedFlights.inbound.departureTime,
                            hasCabins: selectedFlights.inbound.cabins && selectedFlights.inbound.cabins.length > 0,
                            CabinsClass: selectedCabins.inbound,
                            airline: selectedFlights.inbound.airline,
                            flightNumber: selectedFlights.inbound.flightNumber,
                            departureTime: selectedFlights.inbound.departureTime ? formatDate(selectedFlights.inbound.departureTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
                            arrivalTime: selectedFlights.inbound.arrivalTime ? formatDate(selectedFlights.inbound.arrivalTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
                            duration: selectedFlights.inbound.duration
                          } : null
                        }
                      });
                    }}
                  >
                    立即预订 ¥{((selectedCabins.outbound?.price || 0) + (isRoundTrip ? (selectedCabins.inbound?.price || 0) : 0)).toFixed(2)}
                  </button>
                </div>
              )}

              {isRoundTrip ? (
                <div className="round-trip-grid">
                  <div
                    className="flight-column"
                    style={{
                      maxHeight: 'calc(100vh - 180px)',
                      overflowY: 'auto',
                      paddingRight: '10px'
                    }}
                  >
                    <div style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#fff',
                      padding: '10px 0',
                      zIndex: 1,
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 className="section-title">去程航班</h3>
                      {selectedFlights.outbound && selectedCabins.outbound && (
                        <div style={{
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          已选择: {selectedFlights.outbound.flightNumber} - {selectedCabins.outbound.name} - ¥{selectedCabins.outbound.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <FlightList
                      flights={filteredFlights.outbound}
                      loading={loading}
                      onBook={(flight, cabin) => handleFlightSelect(flight, 'outbound', cabin)}
                      currentPage={pagination.outbound.current}
                      pageSize={pagination.outbound.pageSize}
                      totalElements={pagination.outbound.total}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      cities={cities}
                      searchDate={searchParams?.departureDate}
                      selectedFlight={selectedFlights.outbound}
                      selectedCabin={selectedCabins.outbound}
                      isRoundTrip={isRoundTrip}
                    />
                  </div>
                  <div
                    className="flight-column"
                    style={{
                      maxHeight: 'calc(100vh - 180px)',
                      overflowY: 'auto',
                      paddingRight: '10px'
                    }}
                  >
                    <div style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#fff',
                      padding: '10px 0',
                      zIndex: 1,
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 className="section-title">返程航班</h3>
                      {selectedFlights.inbound && selectedCabins.inbound && (
                        <div style={{
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          已选择: {selectedFlights.inbound.flightNumber} - {selectedCabins.inbound.name} - ¥{selectedCabins.inbound.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <FlightList
                      flights={filteredFlights.inbound}
                      loading={loading}
                      onBook={(flight, cabin) => handleFlightSelect(flight, 'inbound', cabin)}
                      currentPage={pagination.inbound.current}
                      pageSize={pagination.inbound.pageSize}
                      totalElements={pagination.inbound.total}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      cities={cities}
                      searchDate={searchParams?.returnDate}
                      selectedFlight={selectedFlights.inbound}
                      selectedCabin={selectedCabins.inbound}
                      isRoundTrip={isRoundTrip}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: 'calc(100vh - 180px)',
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}
                >
                  <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    padding: '10px 0',
                    zIndex: 1,
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 className="section-title">航班列表</h3>
                    {selectedFlights.outbound && selectedCabins.outbound && (
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        已选择: {selectedFlights.outbound.flightNumber} - {selectedCabins.outbound.name} - ¥{selectedCabins.outbound.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <FlightList
                    flights={filteredFlights.outbound}
                    loading={loading}
                    onBook={(flight, cabin) => handleFlightSelect(flight, 'outbound', cabin)}
                    currentPage={pagination.outbound.current}
                    pageSize={pagination.outbound.pageSize}
                    totalElements={pagination.outbound.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    cities={cities}
                    searchDate={searchParams?.departureDate}
                    isReturnFlight={false}
                    selectedFlight={selectedFlights.outbound}
                    selectedCabin={selectedCabins.outbound}
                    isRoundTrip={isRoundTrip}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
