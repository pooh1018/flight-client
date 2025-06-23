import React, { useState, useEffect } from 'react';
import { Message } from '@/components/ui/Message';
import { Tabs, TabPane } from '@/components/ui/Tabs';
import FlightSearchForm from './components/FlightSearchForm';
import FlightList from './components/FlightList/index';
import FlightFilters from './components/FlightFilters';
import flightApi from '@/services/flightApi';
import { getSearchHistory, saveSearchHistory } from '@/utils/storage';
import { formatInTimeZone } from 'date-fns-tz';
import './index.scss';

/**
 * 航班搜索页面
 * @returns {JSX.Element} 航班搜索页面组件
 */
const FlightSearch = ({ onLoginClick = () => {} }) => {
  // 搜索参数
  const [searchParams, setSearchParams] = useState(null);
  // 航班列表
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

  // 获取上次搜索记录
  useEffect(() => {
    const lastSearch = getSearchHistory()[0];
    if (lastSearch) {
      setSearchParams(lastSearch);
    }
  }, []);

  /**
   * 搜索航班
   * @param {Object} params - 搜索参数
   * @param {number} page - 页码，从0开始
   * @param {number} size - 每页条数
   */
  const handleSearch = async (params, page = 0, size = 10) => {
    setLoading(true);
    setSearchParams(params);
    setHasSearched(true);
    setFilters({}); // 重置过滤条件
    setActiveTab('outbound'); // 重置活动标签为去程

    try {
      // 保存搜索历史
      saveSearchHistory(params);

      // 获取用户当地时区
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // 将日期字符串转换为带时区的日期字符串
      const departureDateWithZone = params.departureDate
        ? formatInTimeZone(new Date(params.departureDate), userTimeZone, 'yyyy-MM-dd')
        : null;

      const returnDateWithZone = params.tripType === 'roundtrip' && params.returnDate
        ? formatInTimeZone(new Date(params.returnDate), userTimeZone, 'yyyy-MM-dd')
        : undefined;

      const response = await flightApi.searchFlights({
        from: params.from,
        to: params.to,
        date: departureDateWithZone,
        returnDate: returnDateWithZone,
        cabinClass: params.class,
        passengers: params.passengers,
        page,
        size
      });

      if (response.success) {
        // 处理往返航班和单程航班的不同数据结构
        if (params.tripType === 'roundTrip') {
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

    // 更新当前活动标签的每页条数
    setPagination(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        pageSize: size,
        current: 0 // 切换每页条数时重置为第一页
      }
    }));

    // 重新搜索航班
    handleSearch(searchParams, 0, size);
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
  const [selectedFlight, setSelectedFlight] = useState(null);
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

  const handleFlightSelect = (flight) => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      handleLoginClick({
        from: 'flightCard',
        flightId: flight.id,
        departure: flight.departure,
        arrival: flight.arrival,
        date: flight.date,
        price: flight.price,
        hasCabins: flight.cabins && flight.cabins.length > 0,
        selectedCabinId: flight.selectedCabinId
      });
      return;
    }
    // 已登录则直接跳转到预定确认页面
    navigate('/booking/confirm', { state: { flight } });
  };

  // 当前显示的航班列表
  const currentFlights = filteredFlights[activeTab] || [];
  // 是否为往返航班
  const isRoundTrip = searchParams?.tripType === 'roundTrip';

  return (
    <div className="flight-search-page">
      <div className="content-wrapper">
        {/* 搜索表单区域 */}
        <div className="search-section">
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
              {isRoundTrip ? (
                <>
                  <h3 className="section-title">
                    {activeTab === 'outbound' ? '去程航班' : '返程航班'}
                  </h3>
                  <Tabs activeName={activeTab} onTabClick={(tab) => handleTabChange(tab.props.name)}>
                    <TabPane label="去程航班" name="outbound">
                      <FlightList
                        flights={filteredFlights.outbound}
                        loading={loading && activeTab === 'outbound'}
                        onBook={handleFlightSelect}
                        currentPage={pagination.outbound.current}
                        pageSize={pagination.outbound.pageSize}
                        totalElements={pagination.outbound.total}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </TabPane>
                    <TabPane label="返程航班" name="inbound">
                      <FlightList
                        flights={filteredFlights.inbound}
                        loading={loading && activeTab === 'inbound'}
                        onBook={handleFlightSelect}
                        currentPage={pagination.inbound.current}
                        pageSize={pagination.inbound.pageSize}
                        totalElements={pagination.inbound.total}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </TabPane>
                  </Tabs>
                </>
              ) : (
                <>
                  <h3 className="section-title">航班列表</h3>
                  <FlightList
                    flights={filteredFlights.outbound}
                    loading={loading}
                    onBook={handleFlightSelect}
                    currentPage={pagination.outbound.current}
                    pageSize={pagination.outbound.pageSize}
                    totalElements={pagination.outbound.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
