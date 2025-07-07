import React, { useState, useEffect, useRef } from 'react';
import { Empty, Pagination, Loading } from '@/components/ui';
import FlightCard from '../FlightCard';
import './index.scss';

/**
 * 航班列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.flights - 航班数据列表
 * @param {boolean} props.loading - 加载状态
 * @param {Function} props.onBook - 选择航班回调
 * @param {Function} props.onLoginClick - 登录点击回调
 * @param {number} props.currentPage - 当前页码
 * @param {number} props.pageSize - 每页条数
 * @param {number} props.totalElements - 总数据量
 * @param {Function} props.onPageChange - 页码变化回调
 * @param {Function} props.onPageSizeChange - 每页条数变化回调
 * @param {Array} props.cities - 城市和机场数据列表
 * @returns {JSX.Element} 航班列表组件
 */
const FlightList = ({
  flights = [],
  loading = false,
  onBook,
  onLoginClick,
  currentPage = 0,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
  cities = []
}) => {
  // 本地分页状态
  const [localPagination, setLocalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 当前页的航班数据
  const [currentFlights, setCurrentFlights] = useState([]);

  // 使用ref跟踪用户选择的页码和页大小，避免数据重新加载时被重置
  const userSelectedPageRef = useRef(1);
  const userSelectedPageSizeRef = useRef(pageSize || 10);

  // 分页组件的ref
  const paginationRef = useRef(null);

  // 是否使用本地分页
  const isLocalPagination = !onPageChange;

  // 根据机场ID获取城市和机场信息
  const getCityAndAirportById = (airportId) => {

    // console.log("cities", cities);
    // 处理cities为对象的情况
    if (cities && typeof cities === 'object' && !Array.isArray(cities)) {
      const cityObj = cities.from?.key === airportId ? cities.from :
                     cities.to?.key === airportId ? cities.to : null;
      if (cityObj) {
        return {
          city: cityObj.city || cityObj.name,
          airport: cityObj.airportName,
          airportLabel: cityObj.label
        };
      }
    }

    // 处理cities为数组的情况
    if (Array.isArray(cities)) {
      const cityInfo = cities.find(city => city.key === airportId);
      if (cityInfo) {
        return {
          city: cityInfo.city || cityInfo.name,
          airport: cityInfo.airportName
        };
      }
    }

    // 默认返回
    return {
      city: `城市ID:${airportId}`,
      airport: `机场ID:${airportId}`
    };
  };

  // 处理API返回的航班数据，转换为FlightCard组件期望的格式
  const processFlightData = (flightData) => {
    if (!flightData) return [];

    return flightData.map(item => {
      const { flight } = item;

      // console.log("flight>>>>>>>>>>>>", flight);
      const cabins = flight.cabinClasses || [];

      // 获取最低价格的舱位
      const lowestPriceCabin = cabins && cabins.length > 0
        ? cabins.reduce((min, cabin) => cabin.price < min.price ? cabin : min, cabins[0])
        : null;

      // 从航班号中提取航空公司代码（航班号格式为：XX1234，其中XX为航空公司代码）
      const airlineCode = flight.flightNumber.slice(0, 2);

      // 构建经停信息数组
      const stopsArray = flight.stops > 0 ? Array(flight.stops).fill({
        city: '经停',
        airport: '经停站'
      }) : [];

      // 获取出发和到达城市信息
      const departureInfo = getCityAndAirportById(flight.departureAirportId);
      const arrivalInfo = getCityAndAirportById(flight.destinationAirportId);

      // console.log("departureInfo", departureInfo);
      // console.log("arrivalInfo", arrivalInfo);

      // 构建FlightCard期望的数据结构
      return {
        id: flight.id,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        departureCity: departureInfo.city,
        arrivalCity: arrivalInfo.city,
        departureAirport: departureInfo.airport,
        arrivalAirport: arrivalInfo.airport,
        departureAirportLabel: departureInfo.airportLabel,
        arrivalAirportLabel: arrivalInfo.airportLabel,
        airline: {
          code: airlineCode,
          name: `${airlineCode}航空`
        },
        price: lowestPriceCabin ? lowestPriceCabin.price : flight.price,
        stops: stopsArray,
        duration: calculateDuration(flight.departureTime, flight.arrivalTime),
        cabinClass: lowestPriceCabin ? lowestPriceCabin.name : "Economy",
        seatsAvailable: lowestPriceCabin ? lowestPriceCabin.availableSeats : 0,
        status: flight.status,
        cabins: cabins,
        tags: [
          { text: flight.status === 'scheduled' ? '准点' : '延误', type: flight.status === 'scheduled' ? 'info' : 'danger' },
          lowestPriceCabin && lowestPriceCabin.availableSeats < 10 ? { text: '余票紧张', type: 'danger' } : null,
          flight.stops === 0 ? { text: '直飞', type: 'primary' } : null,
          { text: `${cabins.length}种舱位可选`, type: 'info' }
        ].filter(Boolean)
      };
    });
  };

  // 计算航班持续时间（返回总分钟数）
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 0;

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival - departure;

    if (isNaN(durationMs)) return 0;

    // 返回总分钟数
    return Math.floor(durationMs / (1000 * 60));
  };

  // 只在组件初始化时设置用户选择的页码，避免后续重置
  useEffect(() => {
    // 如果currentPage存在，将userSelectedPageRef初始化为currentPage+1
    if (currentPage !== undefined) {
      userSelectedPageRef.current = currentPage + 1;
    }
  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // 只在组件初始化时设置用户选择的页大小，避免后续重置
  useEffect(() => {
    // 如果pageSize存在，将userSelectedPageSizeRef初始化为pageSize
    if (pageSize !== undefined) {
      userSelectedPageSizeRef.current = pageSize;
    }
  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // 更新分页状态
  useEffect(() => {
    // 处理航班数据
    const processedFlights = Array.isArray(flights) ? processFlightData(flights) : [];

    if (!isLocalPagination) {
      // 使用外部传入的分页配置，始终使用用户选择的页码
      setLocalPagination(prev => ({
        ...prev,
        current: userSelectedPageRef.current, // 始终使用用户选择的页码
        pageSize: userSelectedPageSizeRef.current, // 始终使用用户选择的页大小
        total: totalElements || 0
      }));
      setCurrentFlights(processedFlights);
    } else {
      // 使用本地分页
      setLocalPagination(prev => ({
        ...prev,
        total: processedFlights.length
      }));

      // 计算当前页数据
      const { current, pageSize } = localPagination;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      setCurrentFlights(processedFlights.slice(start, end));
    }
  }, [flights, pageSize, totalElements, isLocalPagination, localPagination.current, localPagination.pageSize]); // 移除 currentPage 依赖

  // 处理分页变化
  const handlePageChange = (page, size) => {
    // 更新用户选择的页码
    userSelectedPageRef.current = page;

    if (isLocalPagination) {
      // 本地分页处理
      if (size !== localPagination.pageSize) {
        // 更新用户选择的页大小
        userSelectedPageSizeRef.current = size;
        // 重置页码为第一页
        userSelectedPageRef.current = 1;

        // 页大小改变时，计算新的总页数
        const processedFlights = Array.isArray(flights) ? processFlightData(flights) : [];
        const newTotalPages = Math.ceil(processedFlights.length / size);

        setLocalPagination(prev => ({
          ...prev,
          current: 1, // 始终重置为第一页
          pageSize: userSelectedPageSizeRef.current
        }));

        // 更新用户选择的页码
        userSelectedPageRef.current = newCurrentPage;

        // 重新计算当前页数据
        const start = (newCurrentPage - 1) * size;
        const end = start + size;
        setCurrentFlights(processedFlights.slice(start, end));
      } else {
        // 只是页码变化
        setLocalPagination(prev => ({
          ...prev,
          current: page
        }));
      }
    } else {
      // 调用外部分页处理
      if (page !== localPagination.current) {
        onPageChange(page - 1); // UI使用从1开始的页码，API使用从0开始的页码
        // 同时更新本地分页状态，确保UI显示正确的页码
        setLocalPagination(prev => ({
          ...prev,
          current: page
        }));
      }

      // 如果页大小改变
      if (size !== localPagination.pageSize && onPageSizeChange) {
        // 更新用户选择的页大小
        userSelectedPageSizeRef.current = size;
        // 重置页码为第一页
        userSelectedPageRef.current = 1;

        // 先更新本地分页状态，确保UI立即响应
        setLocalPagination(prev => ({
          ...prev,
          current: 1, // 重置为第一页
          pageSize: userSelectedPageSizeRef.current
        }));

        // 通知父组件页大小已经改变
        onPageSizeChange(userSelectedPageSizeRef.current);

        // 如果有页码改变回调，通知父组件页码已重置为第一页
        if (onPageChange) {
          onPageChange(0); // API使用从0开始的页码
        }

        // 计算新的总页数
        const newTotalPages = Math.ceil(localPagination.total / size);

        // 如果当前页码超出新的总页数，则调整到最后一页
        // 否则保持当前页码不变
        const newCurrentPage = page > newTotalPages ? newTotalPages : page;

        // 如果页码需要调整，更新本地状态和通知父组件
        if (newCurrentPage !== page) {
          setLocalPagination(prev => ({
            ...prev,
            current: newCurrentPage
          }));

          // 更新用户选择的页码
          userSelectedPageRef.current = newCurrentPage;

          // 通知父组件页码已经改变
          if (onPageChange) {
            onPageChange(newCurrentPage - 1); // UI使用从1开始的页码，API使用从0开始的页码
          }
        }
      }
    }

    // 使用setTimeout确保在状态更新后执行
    setTimeout(() => {
      // 如果ref存在，将焦点设置回分页组件
      if (paginationRef.current) {
        // 使用scrollIntoView确保分页组件在视图中
        paginationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  // 渲染航班列表
  const renderFlights = () => {
    if (loading) {
      return (
        <div className="flight-list-loading">
          <Loading size="large" />
        </div>
      );
    }

    if (!currentFlights.length) {
      return (
        <Empty
          description="暂无符合条件的航班"
          className="flight-list-empty"
        />
      );
    }

    return currentFlights.map((flight, index) => {
      // 确保key的唯一性
      let key;
      if (flight.id) {
        key = flight.id;
      } else if (flight.flightNumber || flight.departureTime) {
        key = `${flight.flightNumber || 'unknown'}-${flight.departureTime || 'unknown'}`;
      } else {
        console.warn('Flight data missing unique identifier, using index as key - please fix data');
        key = index;
      }

      return (
        <FlightCard
          key={key}
          flight={flight}
          onSelect={onBook}
          onLoginClick={onLoginClick}
        />
      );
    });
  };

  return (
    <div className="flight-list-container">
      <div className="flight-list">
        {renderFlights()}
      </div>

      {/* 分页 */}
      {localPagination.total > 0 && (
        <div className="flight-list-pagination" ref={paginationRef}>
          <div className="pagination-container">
            <div className="flight-list-pagination">
              <Pagination
                current={localPagination.current}
                pageSize={localPagination.pageSize}
                total={localPagination.total}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={total => `共 ${total} 条`}
                disabled={loading}
                responsive="true"
                hideOnSinglePage={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightList;
