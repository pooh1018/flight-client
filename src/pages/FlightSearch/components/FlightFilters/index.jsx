import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import Slider from '@/components/ui/Slider';
import Button from '@/components/ui/Button';
import Collapse from '@/components/ui/Collapse';
import { getAirlineByCode } from '@/config';
import { TIME_SLOTS, STOP_OPTIONS, CABIN_CLASSES } from '@/config';
import { formatPrice } from '@/utils/formatters';
import { getTimeSlotName } from '@/utils/helpers';
import './index.scss';

/**
 * 航班过滤器组件
 * @param {Object} props - 组件属性
 * @param {Array} props.flights - 航班列表
 * @param {Object} props.filters - 过滤条件
 * @param {Function} props.onFilterChange - 过滤条件变化回调
 * @param {Function} props.onReset - 重置过滤器回调
 * @returns {JSX.Element} 航班过滤器组件
 */
const FlightFilters = ({ flights = [], filters = {}, onFilterChange, onReset }) => {
  // 航空公司选项
  const [airlineOptions, setAirlineOptions] = useState([]);
  // 价格范围
  const [priceRange, setPriceRange] = useState([0, 10000]);
  // 最低价格
  const [minPrice, setMinPrice] = useState(0);
  // 最高价格
  const [maxPrice, setMaxPrice] = useState(10000);

  // 当航班列表变化时，更新航空公司选项和价格范围
  useEffect(() => {
    if (flights.length > 0) {
      // 提取所有航空公司
      const airlines = [...new Set(flights.map(flight => flight.airline.code))];
      const airlineOpts = airlines.map(code => {
        const airline = getAirlineByCode(code) || { code, name: code };
        return {
          value: code,
          label: airline.name,
          logo: airline.logo
        };
      });

      setAirlineOptions(airlineOpts);

      // 提取价格范围
      const prices = flights.map(flight => flight.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
    }
  }, [flights]);

  // 当过滤条件变化时，更新组件状态
  useEffect(() => {
    if (filters.priceRange) {
      setPriceRange(filters.priceRange);
    }
  }, [filters]);

  // 处理航空公司过滤变化
  const handleAirlineChange = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        airlines: value
      });
    }
  };

  // 处理价格范围变化
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };

  // 价格范围变化结束后触发过滤
  const handlePriceRangeEnd = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        priceRange: value
      });
    }
  };

  // 处理出发时间过滤变化
  const handleDepartureTimeChange = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        departureTime: value
      });
    }
  };

  // 处理到达时间过滤变化
  const handleArrivalTimeChange = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        arrivalTime: value
      });
    }
  };

  // 处理经停次数过滤变化
  const handleStopsChange = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        stops: value
      });
    }
  };

  // 处理舱位等级过滤变化
  const handleCabinClassChange = (value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        cabinClass: value
      });
    }
  };

  // 重置所有过滤器
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="flight-filters">
      <Card className="filters-card">
        <div className="filters-header">
          <h3 className="filters-title">筛选条件</h3>
          <Button type="link" className="reset-button" onClick={handleReset}>
            重置
          </Button>
        </div>

        <Collapse defaultActiveKey={['price', 'airline', 'time', 'stops']}>
          {/* 价格范围过滤 */}
          <Collapse.Panel header="价格范围" key="price">
            <div className="filter-section price-filter">
              <div className="price-range-display">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>

              <Slider
                range
                defaultValue={[minPrice, maxPrice]}
                value={priceRange}
                min={minPrice}
                max={maxPrice}
                step={100}
                marks={{}}
                onChange={handlePriceRangeChange}
                onChangeComplete={handlePriceRangeEnd}
                pushable={true}
                allowCross={false}
                trackStyle={[{ backgroundColor: '#1890ff' }]}
                handleStyle={[
                  { borderColor: '#1890ff' },
                  { borderColor: '#1890ff' }
                ]}
                railStyle={{ backgroundColor: '#e9e9e9' }}
              />
            </div>
          </Collapse.Panel>

          {/* 航空公司过滤 */}
          <Collapse.Panel header="航空公司" key="airline">
            <div className="filter-section airline-filter">
              <Checkbox.Group
                value={filters.airlines || []}
                onChange={handleAirlineChange}
              >
                {airlineOptions.map(airline => (
                  <div key={airline.value} className="airline-option">
                    <Checkbox value={airline.value}>
                      <div className="airline-info">
                        {airline.logo && (
                          <img
                            src={airline.logo}
                            alt={airline.label}
                            className="airline-logo"
                          />
                        )}
                        <span>{airline.label}</span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </div>
          </Collapse.Panel>

          {/* 时间过滤 */}
          <Collapse.Panel header="起降时间" key="time">
            <div className="filter-section time-filter">
              <div className="time-filter-group">
                <h4>出发时间</h4>
                <Checkbox.Group
                  value={filters.departureTime || []}
                  onChange={handleDepartureTimeChange}
                >
                  {TIME_SLOTS.map(slot => (
                    <div key={slot.value} className="time-option">
                      <Checkbox value={slot.value}>
                        {slot.label}
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </div>

              <div className="time-filter-group">
                <h4>到达时间</h4>
                <Checkbox.Group
                  value={filters.arrivalTime || []}
                  onChange={handleArrivalTimeChange}
                >
                  {TIME_SLOTS.map(slot => (
                    <div key={slot.value} className="time-option">
                      <Checkbox value={slot.value}>
                        {slot.label}
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </div>
            </div>
          </Collapse.Panel>

          {/* 经停次数过滤 */}
          <Collapse.Panel header="经停次数" key="stops">
            <div className="filter-section stops-filter">
              <Checkbox.Group
                value={filters.stops || []}
                onChange={handleStopsChange}
              >
                {STOP_OPTIONS.map(option => (
                  <div key={option.value} className="stop-option">
                    <Checkbox value={option.value}>
                      <div className="stop-info">
                        <span className="stop-label">{option.label}</span>
                        <span className="stop-description">{option.description}</span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </div>
          </Collapse.Panel>

          {/* 舱位等级过滤 */}
          <Collapse.Panel header="舱位等级" key="cabin">
            <div className="filter-section cabin-filter">
              <Checkbox.Group
                value={filters.cabinClass ? [filters.cabinClass] : []}
                onChange={(value) => handleCabinClassChange(value.length > 0 ? value[0] : '')}
              >
                {CABIN_CLASSES.map(cabin => (
                  <div key={cabin.value} className="cabin-option">
                    <Checkbox value={cabin.value}>
                      <div className="cabin-info">
                        <span className="cabin-label">{cabin.label}</span>
                        <span className="cabin-description">{cabin.description}</span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </div>
          </Collapse.Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default FlightFilters;
