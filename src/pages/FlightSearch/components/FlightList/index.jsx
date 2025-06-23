import React, { useState, useEffect } from 'react';
import { Empty, Pagination, Loading } from '@/components/ui';
import FlightCard from '../FlightCard';
import './index.scss';

/**
 * 航班列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.flights - 航班数据列表
 * @param {boolean} props.loading - 加载状态
 * @param {Function} props.onBook - 选择航班回调
 * @param {number} props.currentPage - 当前页码
 * @param {number} props.pageSize - 每页条数
 * @param {number} props.totalElements - 总数据量
 * @param {Function} props.onPageChange - 页码变化回调
 * @param {Function} props.onPageSizeChange - 每页条数变化回调
 * @returns {JSX.Element} 航班列表组件
 */
const FlightList = ({
  flights = [],
  loading = false,
  onBook,
  currentPage = 0,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange
}) => {
  // 本地分页状态
  const [localPagination, setLocalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 当前页的航班数据
  const [currentFlights, setCurrentFlights] = useState([]);

  // 是否使用本地分页
  const isLocalPagination = !onPageChange;

  // 处理API返回的航班数据，转换为FlightCard组件期望的格式
  const processFlightData = (flightData) => {
    if (!flightData) return [];

    return flightData.map(item => {
      const { flight, cabins } = item;

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

      // 构建FlightCard期望的数据结构
      return {
        id: flight.id,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        departureCity: `城市:${flight.departureAirportId}`,
        arrivalCity: `城市:${flight.destinationAirportId}`,
        departureAirport: `机场:${flight.departureAirportId}`,
        arrivalAirport: `机场:${flight.destinationAirportId}`,
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
        cabins: flight.cabinClasses || cabins, // 使用cabinClasses或cabins
        tags: [
          { text: flight.status === 'scheduled' ? '准点' : '延误', type: flight.status === 'scheduled' ? 'success' : 'warning' },
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

  // 更新分页状态
  useEffect(() => {
    // 处理航班数据
    const processedFlights = Array.isArray(flights) ? processFlightData(flights) : [];

    if (!isLocalPagination) {
      // 使用外部传入的分页配置
      setLocalPagination({
        current: currentPage + 1, // API使用从0开始的页码，UI使用从1开始的页码
        pageSize: pageSize || 10,
        total: totalElements || 0
      });
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
  }, [flights, currentPage, pageSize, totalElements, isLocalPagination, localPagination.current, localPagination.pageSize]);

  // 处理分页变化
  const handlePageChange = (page, size) => {
    if (isLocalPagination) {
      // 本地分页处理
      setLocalPagination(prev => ({
        ...prev,
        current: page,
        pageSize: size
      }));
    } else {
      // 调用外部分页处理
      if (page !== localPagination.current) {
        onPageChange(page - 1); // UI使用从1开始的页码，API使用从0开始的页码
      }

      // 如果页大小改变
      if (size !== localPagination.pageSize && onPageSizeChange) {
        onPageSizeChange(size);
        setLocalPagination(prev => ({
          ...prev,
          pageSize: size,
          current: 1 // 切换页大小时重置到第一页
        }));
      }
    }
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
        <div className="flight-list-pagination">
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
                responsive
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
