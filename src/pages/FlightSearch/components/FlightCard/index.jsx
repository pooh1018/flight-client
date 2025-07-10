import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Tooltip, Collapse } from '@/components/ui';
import { AIRLINE_LOGO_PATH, getAirlineByCode } from '@/config';
import { formatPrice, formatTime, formatDuration, formatDate } from '@/utils/formatters';
import './index.scss';

/**
 * 航班卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.flight - 航班信息
 * @param {boolean} props.isReturnFlight - 是否是回程航班
 * @param {Function} props.onSelect - 选择航班回调
 * @param {Object} props.selectedCabin - 已选择的舱位信息
 * @param {Function} props.onLoginClick - 登录点击回调
 * @param {Date|string} props.searchDate - 检索框中的出发日期
 * @param {boolean} props.isSelected - 是否被选中
 * @param {boolean} props.isRoundTrip - 是否是往返行程
 * @returns {JSX.Element} 航班卡片组件
 */
const FlightCard = ({
  flight,
  isReturnFlight = false,
  onSelect,
  selectedCabin,
  onLoginClick,
  searchDate,
  isSelected = false,
  isRoundTrip = false
}) => {

  const navigate = useNavigate();
  // 添加状态来跟踪是否展开舱位选择面板
  const [showCabins, setShowCabins] = useState(false);
  // 当前选中的舱位ID和舱位信息
  const [selectedCabinId, setSelectedCabinId] = useState(selectedCabin?.id || null);
  const [selectedCabinInfo, setSelectedCabinInfo] = useState(selectedCabin || null);

  // 监听selectedCabin属性的变化，更新组件内部状态
  useEffect(() => {
    if (selectedCabin) {
      setSelectedCabinId(selectedCabin.id);
      setSelectedCabinInfo(selectedCabin);
    } else {
      setSelectedCabinId(null);
      setSelectedCabinInfo(null);
    }
  }, [selectedCabin]);

  // 检查所有舱位是否都已售罄
  const allCabinsSoldOut = flight.cabins && flight.cabins.length > 0 &&
    flight.cabins.every(cabin => cabin.availableSeats === 0);

  // 检查航班日期是否与搜索日期一致
  const isDifferentDate = () => {
    if (!searchDate || !flight.departureTime) return false;

    const flightDate = formatDate(flight.departureTime, 'YYYY-MM-DD');
    const searchDateFormatted = typeof searchDate === 'string'
      ? formatDate(searchDate, 'YYYY-MM-DD')
      : formatDate(searchDate, 'YYYY-MM-DD');

    return flightDate !== searchDateFormatted;
  };

  const {
    id,
    airline,
    flightNumber,
    departureTime,
    arrivalTime,
    departureCity,
    arrivalCity,
    departureAirport,
    arrivalAirport,
    duration,
    price,
    stops,
    cabinClass,
    seatsAvailable,
    discount,
    tags
  } = flight;

  // 获取航空公司信息
  const airlineInfo = airline && getAirlineByCode(airline.code);

  // 计算折扣价格
  const discountedPrice = price && discount ? price * (1 - discount) : price;

  // 获取经停信息显示
  const getStopsDisplay = () => {
    if (!stops || stops.length === 0) {
      return (
          <div className="direct-flight">
              <span className="stop-line"/>
              {/*<span className="stop-text">直飞</span>*/}
              <div className="stop-tags" style={{display: 'flex', gap: '8px'}}>
                  <Tag
                      type="primary"
                      size="default"
                  >
                      直飞
                  </Tag>
              </div>
          </div>
      );
    }

      return (
          <div className="stops-flight">
              <div className="stop-points">
                  {stops.map((stop, index) => (
                      <Tooltip
                          key={index}
                          content={`${stop?.city || '未知城市'} - ${stop?.airport || '未知机场'}`}
                          placement="top"
                      >
                          <div className="stop-point"/>
                      </Tooltip>
                  ))}
              </div>
              <span className="stop-text">
          {stops.length}次经停
        </span>
          </div>
      );
  };

  return (
    <Card
      className={`flight-card ${isSelected ? 'selected-flight' : ''}`}
      style={{
        border: isSelected ? '2px solid #1890ff' : '1px solid #e8e8e8',
        boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none'
      }}
      onClick={(e) => {
        // 检查点击是否发生在舱位选择面板内
        const isClickInCabinPanel = e.target.closest('.cabin-selection');
        // 检查点击是否发生在按钮上
        const isClickOnButton = e.target.closest('button');
        
        // 如果点击在舱位面板内或按钮上，不处理
        if (isClickInCabinPanel || isClickOnButton) return;
        
        // 切换展开/收起状态
        if (flight.cabins && flight.cabins.length > 0) {
          setShowCabins(!showCabins);
        }
      }}
    >
        {/* 日期不一致提示 */}
        {isDifferentDate() && (
          <div className="date-notice" style={{
            textAlign: 'right',
            marginBottom: '8px',
            position: 'absolute',
            top: '10px',
            right: '10px'
          }}>
            <Tag type="primary" size="default">
              无当日航班，为您推荐{formatDate(flight.departureTime, 'YYYY年MM月DD日')}航班
            </Tag>
          </div>
        )}

        {/* 航空公司信息 - 右对齐 */}
        <div className="airline-info" style={{ justifyContent: 'flex-end' }}>
            {airlineInfo?.logoPath && (
                <img
                    src={airlineInfo.logoPath}
                    alt={airlineInfo.name}
                    className="airline-logo"
                    style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain'
                    }}
                />
            )}
            {!airlineInfo && (
                <img
                    src={`${AIRLINE_LOGO_PATH}default.png`}
                    alt={'未知航空公司'}
                    className="airline-logo"
                    style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain'
                    }}
                />
            )}
            <span className="airline-name">{airlineInfo?.name || (airline && airline.code) || '未知航空公司'}</span>
            <span className="flight-number">{flightNumber || '未知航班'}</span>
        </div>

        {/* 航班主要信息 */}
        <div className="flight-main">
          {/* 出发信息 */}
          <div className="flight-point departure">
          <div className="time">{departureTime ? formatTime(departureTime) : '未知'}</div>
          <div className="city">{departureCity || '未知城市'}</div>
          <div className="airport">{departureAirport || '未知机场'}</div>
        </div>

        {/* 航班信息 */}
        <div className="flight-info" style={{ flex: '1 1 auto', minWidth: '60px' }}>
          <div className="duration">
            <span>{duration ? formatDuration(duration) : '未知'}</span>
          </div>

          {/* 经停信息 */}
          {getStopsDisplay()}
        </div>

        {/* 到达信息 */}
        <div className="flight-point arrival">
          <div className="time">{arrivalTime ? formatTime(arrivalTime) : '未知'}</div>
          <div className="city">{arrivalCity || '未知城市'}</div>
          <div className="airport">{arrivalAirport || '未知机场'}</div>
        </div>
      </div>

      {/* 三栏布局容器 - 稳定版 */}
      <div className="flight-layout-container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(200px, auto) 1fr',
        width: '100%',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        {/* 左: 航班标签 */}
        <div className="flight-tags-container" style={{ justifySelf: 'start' }}>
          {tags && tags.length > 0 && (
            <div className="flight-tags" style={{ display: 'flex', gap: '8px' }}>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  type={tag.type || 'primary'}
                  size="small"
                >
                  {tag.text}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 中: 价格和已选仓位 */}
        <div className="flight-price-info" style={{
          justifySelf: 'center',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          {selectedCabinInfo ? (
            <div className="selected-cabin">
              {selectedCabinInfo.name} : {formatPrice(selectedCabinInfo.price)}
            </div>
          ) : (
            <div className="no-cabin-selected">
              {allCabinsSoldOut ? (
                <Tag type="danger" size="default" className="sold-out-tag">全部售罄</Tag>
              ) : (
                '请选择仓位'
              )}
            </div>
          )}
        </div>

        {/* 右: 操作按钮 */}
        <div className="flight-action" style={{
          justifySelf: 'end',
          display: 'flex',
          gap: '16px'
        }}>
            {/*<div className="price-info">*/}
            {/*  {price && discount ? (*/}
            {/*    <>*/}
            {/*      <div className="original-price">*/}
            {/*        {formatPrice(price)}*/}
            {/*      </div>*/}
            {/*      <div className="current-price">*/}
            {/*        {formatPrice(discountedPrice)}*/}
            {/*        <Tag type="danger" size="small" className="discount-tag">*/}
            {/*          {(discount * 100).toFixed(0)}折*/}
            {/*        </Tag>*/}
            {/*      </div>*/}
            {/*    </>*/}
            {/*  ) : (*/}
            {/*    <div className="current-price">*/}
            {/*      {price ? formatPrice(price) : '价格未知'}*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*  <div className="price-details">*/}
            {/*    <span className="cabin-class">{cabinClass || '经济舱'}</span>*/}
            {/*    <span className="seats-info">*/}
            {/*      {seatsAvailable !== undefined ? (*/}
            {/*        seatsAvailable > 0 ? (*/}
            {/*          `剩余${seatsAvailable}张`*/}
            {/*        ) : (*/}
            {/*          <span className="sold-out">已售罄</span>*/}
            {/*        )*/}
            {/*      ) : (*/}
            {/*        '座位信息未知'*/}
            {/*      )}*/}
            {/*    </span>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (flight.cabins && flight.cabins.length > 0) {
                  setShowCabins(!showCabins);
                } else {
                  onSelect && onSelect(flight);
                }
              }}
            >
              {flight.cabins && flight.cabins.length > 0
                ? (showCabins ? '收起' : (allCabinsSoldOut ? '全部售罄' : '选择舱位'))
                : (seatsAvailable !== undefined ? (seatsAvailable > 0 ? '选择' : '已售罄') : '选择')}
            </Button>
            {/* 移除了"立即预定"按钮，因为已在FlightSearch组件中添加了统一的预订按钮 */}

          </div>
      </div>

      {/* 舱位选择面板 */}
      {showCabins && flight.cabins && flight.cabins.length > 0 && (
        <div className="cabin-selection">
          <div className="cabin-selection-header">
            <h4>选择舱位</h4>
          </div>
          <div className="cabin-selection-content">
            {flight.cabins.map((cabin) => (
              <div
                key={cabin.id}
                className={`cabin-option ${selectedCabinId === cabin.id ? 'selected' : ''} ${cabin.availableSeats === 0 ? 'sold-out' : ''}`}
                onClick={() => {
                  // 如果座位数为0，不允许选择
                  if (cabin.availableSeats > 0) {
                    setSelectedCabinId(cabin.id);
                    setSelectedCabinInfo(cabin);
                    onSelect && onSelect(flight, cabin);
                  }
                }}
              >
                <div className="cabin-info">
                  <div className="cabin-name">{cabin.name}</div>
                  <div className="cabin-details">
                    {cabin.availableSeats > 0 ? (
                      <span>可用座位: {cabin.availableSeats}</span>
                    ) : null}
                    {cabin.features && cabin.features.map((feature, idx) => (
                      <span key={idx} className="cabin-feature">{feature}</span>
                    ))}
                  </div>
                  {cabin.availableSeats === 0 && (
                    <div className="sold-out-overlay">
                      <Tag type="danger" size="large" className="sold-out-tag">已售罄</Tag>
                    </div>
                  )}
                </div>
                <div className="cabin-price">
                  <span className="price-amount">¥{cabin.price}</span>
                  <Button
                    size="small"
                    type={selectedCabinId === cabin.id ? "primary" : "default"}
                    disabled={cabin.availableSeats === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cabin.availableSeats > 0) {
                        setSelectedCabinId(cabin.id);
                        setSelectedCabinInfo(cabin);
                        onSelect && onSelect(flight, cabin);
                      }
                    }}
                  >
                    {selectedCabinId === cabin.id ? '已选择' : (cabin.availableSeats === 0 ? '已售罄' : '选择')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FlightCard;
