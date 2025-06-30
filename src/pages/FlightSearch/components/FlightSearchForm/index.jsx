import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormItem, Select, DatePicker, Button } from '@/components/ui';
import { CABIN_CLASSES, fetchAirportData } from '@/config';
import './index.scss';

const FlightSearchForm = ({ onSearch }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  // 创建一个只包含日期部分的Date对象
  const createDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    // 重置时间部分为00:00:00
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // 初始化时从localStorage读取数据
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('flightSearchParams');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // 转换日期字符串回Date对象，只保留日期部分
        if (parsedData.departureDate) {
          parsedData.departureDate = createDateOnly(parsedData.departureDate);
        }
        if (parsedData.returnDate) {
          parsedData.returnDate = createDateOnly(parsedData.returnDate);
        }
        return parsedData;
      } catch (error) {
        console.error('解析保存的表单数据时出错:', error);
      }
    }
    return {
      from: '',
      to: '',
      departureDate: null,
      returnDate: null,
      class: 'economy',
      passengers: 1,
      tripType: 'oneway'
    };
  });

  // 获取今天的日期，用于限制日期选择
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 从配置文件中获取机场数据
  useEffect(() => {
    const loadAirports = async () => {
      setLoading(true);
      try {
        const formattedCities = await fetchAirportData();
        setCities(formattedCities);
      } catch (error) {
        console.error('Failed to fetch airports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAirports();
  }, []);

  // 当formData变化时，保存到localStorage
  useEffect(() => {
    // 创建一个副本以避免修改原始对象
    const dataToSave = { ...formData };

    // 将Date对象转换为ISO字符串
    if (dataToSave.departureDate) {
      dataToSave.departureDate = dataToSave.departureDate.toISOString();
    }
    if (dataToSave.returnDate) {
      dataToSave.returnDate = dataToSave.returnDate.toISOString();
    }

    localStorage.setItem('flightSearchParams', JSON.stringify(dataToSave));
    console.log('搜索参数已保存到localStorage:', dataToSave);
  }, [formData]);

  const handleChange = (name, value) => {
    console.log(`Handling change for ${name}:`, value);

    // 确保日期值是Date对象，并且只包含日期部分
    let processedValue = value;
    if ((name === 'departureDate' || name === 'returnDate') && value) {
      if (!(value instanceof Date)) {
        processedValue = new Date(value);
      }
      // 重置时间部分为00:00:00
      processedValue.setHours(0, 0, 0, 0);
      console.log(`Processed ${name}:`, processedValue);
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue
      };

      if (name === 'departureDate' && newData.returnDate) {
        const departureDate = new Date(processedValue);
        const returnDate = new Date(newData.returnDate);
        departureDate.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        if (returnDate < departureDate) {
          newData.returnDate = null;
        }
      }

      if (name === 'tripType' && processedValue === 'oneway') {
        newData.returnDate = null;
      }

      return newData;
    });
  };

  const handlePassengerChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      passengers: Math.min(Math.max(prev.passengers + increment, 1), 9)
    }));
  };

  const handleSwapCities = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    console.log('Cities swapped');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      // 从cities中查找选中的出发和到达城市
      const fromCity = cities.find(city => city.key === formData.from);
      const toCity = cities.find(city => city.key === formData.to);

      onSearch({
        ...formData,
        departureAirportId: fromCity?.value, // 使用value（即airportId）
        arrivalAirportId: toCity?.value,     // 使用value（即airportId）
        cities: {                            // 保持cities对象以供其他用途
          from: fromCity,
          to: toCity
        }
      });
    }
  };

  const validateForm = () => {
    const requiredFieldsValid =
      formData.from &&
      formData.to &&
      formData.departureDate &&
      formData.class;

    if (formData.tripType === 'roundtrip') {
      return requiredFieldsValid && formData.returnDate;
    }
    return requiredFieldsValid;
  };

  return (
    <div className="flight-search-form">
      <div className="trip-type-tabs">
        <button
          className={`tab-button ${formData.tripType === 'oneway' ? 'active' : ''}`}
          onClick={() => handleChange('tripType', 'oneway')}
        >
          单程
        </button>
        <button
          className={`tab-button ${formData.tripType === 'roundtrip' ? 'active' : ''}`}
          onClick={() => handleChange('tripType', 'roundtrip')}
        >
          往返
        </button>
      </div>

      <Form onSubmit={handleSubmit} layout="vertical">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label required">出发地</label>
            <Select
              value={formData.from}
              onChange={(value) => handleChange('from', value)}
              placeholder="请选择出发城市"
              options={cities}
              showSearch
              noMatchText="未找到匹配的出发城市"
            />
            {!formData.from && <div className="error-message">请选择出发城市</div>}
          </div>

          <div className="swap-button-container">
            <button
              type="button"
              className="swap-button"
              onClick={handleSwapCities}
              title="交换城市"
            >
              ⇄
            </button>
          </div>

          <div className="form-field">
            <label className="form-label required">目的地</label>
            <Select
              value={formData.to}
              onChange={(value) => handleChange('to', value)}
              placeholder="请选择目的城市"
              options={cities}
              showSearch
              noMatchText="未找到匹配的目的城市"
              loading={loading}
            />
            {!formData.to && <div className="error-message">请选择目的城市</div>}
          </div>
        </div>

        <div className="form-row dates-row">
          <div className="date-fields-container">
            <div className="date-field">
              <FormItem
                label="出发日期"
                required
                error={!formData.departureDate ? '请选择出发日期' : ''}
                className="form-item-date"
              >
                <DatePicker
                  value={formData.departureDate}
                  onChange={(date) => handleChange('departureDate', date)}
                  placeholder="请选择出发日期"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    // 确保日期比较的时间部分都是0
                    if (!current) return false;
                    const currentDate = new Date(current);
                    currentDate.setHours(0, 0, 0, 0);
                    return currentDate < today;
                  }}
                />
              </FormItem>
            </div>

            {formData.tripType === 'roundtrip' && (
              <div className="date-field">
                <FormItem
                  label="返程日期"
                  required
                  error={!formData.returnDate ? '请选择返程日期' : ''}
                  className="form-item-date"
                >
                  <DatePicker
                    value={formData.returnDate}
                    onChange={(date) => handleChange('returnDate', date)}
                    placeholder="请选择返程日期"
                    format="YYYY-MM-DD"
                    disabledDate={(current) => {
                      if (!current) return false;

                      // 确保日期比较的时间部分都是0
                      const currentDate = new Date(current);
                      currentDate.setHours(0, 0, 0, 0);

                      // 使用出发日期或今天作为最早可选日期
                      const departureDate = formData.departureDate || today;
                      const minDate = new Date(departureDate);
                      minDate.setHours(0, 0, 0, 0);

                      return currentDate < minDate;
                    }}
                  />
                </FormItem>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <FormItem
            label="乘客"
            required
            className="form-item-passengers"
          >
            <div className="passengers-selector">
              <button
                type="button"
                className="passenger-button"
                onClick={() => handlePassengerChange(-1)}
                disabled={formData.passengers <= 1}
              >
                -
              </button>
              <span className="passenger-count">{formData.passengers}</span>
              <button
                type="button"
                className="passenger-button"
                onClick={() => handlePassengerChange(1)}
                disabled={formData.passengers >= 9}
              >
                +
              </button>
            </div>
          </FormItem>

          <div className="form-field">
            <label className="form-label required">舱位</label>
            <Select
              value={formData.class}
              onChange={(value) => handleChange('class', value)}
              placeholder="请选择舱位"
              options={CABIN_CLASSES}
              showSearch
              noMatchText="未找到匹配的舱位"
            />
            {!formData.class && <div className="error-message">Please select cabin class</div>}
          </div>
        </div>

        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="search-button"
            disabled={!validateForm()}
          >
            搜索航班
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default FlightSearchForm;
