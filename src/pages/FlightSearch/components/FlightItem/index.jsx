import React from 'react';
import { Link } from 'react-router-dom';
import { formatTime, formatDuration, formatPrice } from '@/utils/formatters';
import { AIRLINE_LOGO_PATH } from '@/config';
import './index.scss';

/**
 * 航班列表项组件
 * @param {Object} props - 组件属性
 * @param {Object} props.flight - 航班信息
 * @param {Function} props.onSelect - 选择航班回调
 * @returns {JSX.Element} 航班列表项组件
 */
const FlightItem = ({ flight, onSelect }) => {
  if (!flight) return null;

  const {
    id,
    airline,
    flightNumber,
    departureAirport,
    arrivalAirport,
    departureTime,
    arrivalTime,
    duration,
    stops,
    price,
    cabinClass,
    seatsAvailable,
    punctualityRate
  } = flight;

  // 格式化起飞和到达时间
  const formattedDepartureTime = formatTime(departureTime);
  const formattedArrivalTime = formatTime(arrivalTime);

  // 格式化飞行时长
  const formattedDuration = formatDuration(duration);

  // 获取舱位等级显示名称
  const getCabinClassName = (cabin) => {
    switch (cabin) {
      case 'economy':
        return '经济舱';
      case 'premium':
        return '高级经济舱';
      case 'business':
        return '商务舱';
      case 'first':
        return '头等舱';
      default:
        return '经济舱';
    }
  };

  // 获取经停标签类型
  const getStopsTagType = (stops) => {
    if (stops === 0) return 'success';
    if (stops === 1) return 'warning';
    return 'danger';
  };

  // 获取经停文本
  const getStopsText = (stops) => {
    if (stops === 0) return '直飞';
    if (stops === 1) return '1次经停';
    return `${stops}次经停`;
  };

  // 获取座位可用性标签类型
  const getSeatsTagType = (seats) => {
    if (seats > 10) return 'success';
    if (seats > 0) return 'warning';
    return 'danger';
  };

  // 获取座位可用性文本
  const getSeatsText = (seats) => {
    if (seats > 10) return `座位充足 (${seats})`;
    if (seats > 0) return `座位有限 (${seats})`;
    return '已售罄';
  };

  // 获取准点率标签类型
  const getPunctualityTagType = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'danger';
  };

  return (
    <div className="flight-item">
      <div className="flight-item-content">
        {/* 航空公司信息 */}
        <div className="airline-info">
          <div className="airline-logo">
            <img
              src={airline.logoPath}
              alt={airline.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${AIRLINE_LOGO_PATH}default.png`;
              }}
            />
          </div>
          <div className="airline-details">
            <div className="airline-name">{airline.name}</div>
            <div className="flight-number">{airline.code} {flightNumber}</div>
          </div>
        </div>

        {/* 航班时间信息 */}
        <div className="flight-time-info">
          <div className="departure">
            <div className="time">{formattedDepartureTime}</div>
            <div className="airport">{departureAirport.code}</div>
            <div className="city">{departureAirport.city}</div>
          </div>

          <div className="flight-path">
            <div className="duration">{formattedDuration}</div>
            <div className="path-line">
              <div className="stops-indicator">
                {stops > 0 && (
                  <div className="stops-dot"></div>
                )}
              </div>
            </div>
            <div className="stops">
              <span className={`custom-tag ${getStopsTagType(stops)}`}>{getStopsText(stops)}</span>
            </div>
          </div>

          <div className="arrival">
            <div className="time">{formattedArrivalTime}</div>
            <div className="airport">{arrivalAirport.code}</div>
            <div className="city">{arrivalAirport.city}</div>
          </div>
        </div>

        {/* 航班详情信息 */}
        <div className="flight-details">
          <div className="detail-item">
            <span className="label">舱位：</span>
            <span className="value">{getCabinClassName(cabinClass)}</span>
          </div>

          <div className="detail-item">
            <span className="label">座位：</span>
            <span className={`custom-tag small ${getSeatsTagType(seatsAvailable)}`}>
              {getSeatsText(seatsAvailable)}
            </span>
          </div>

          <div className="detail-item custom-tooltip-container">
            <span className="label">准点率：</span>
            <div className="custom-tooltip">
              <span className={`custom-tag small ${getPunctualityTagType(punctualityRate)}`}>
                {punctualityRate}%
              </span>
              <div className="tooltip-content">
                航班准点率
              </div>
            </div>
          </div>
        </div>

        {/* 价格和操作按钮 */}
        <div className="price-action">
          <div className="price">
            <div className="amount">{formatPrice(price)}</div>
            <div className="unit">含税总价</div>
          </div>

          <div className="actions">
            <Link to={`/flight/${id}`}>
              <button className="custom-button text small">详情</button>
            </Link>
            <button
              className="custom-button primary small"
              onClick={() => onSelect && onSelect(flight)}
              disabled={seatsAvailable <= 0}
            >
              选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightItem;
