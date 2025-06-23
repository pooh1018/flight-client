import React, { useState, useEffect } from 'react';
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
    const savedData = localStorage.getItem('flightSearchFormData');
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
        console.error('Error parsing saved form data:', error);
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

    localStorage.setItem('flightSearchFormData', JSON.stringify(dataToSave));
    // console.log('Saved to localStorage:', dataToSave);
  }, [formData]);

  // 用于调试
  // useEffect(() => {
  //   console.log('Current formData:', formData);
  //   if (formData.departureDate) {
  //     console.log('Departure date type:', typeof formData.departureDate);
  //     console.log('Departure date instanceof Date:', formData.departureDate instanceof Date);
  //     console.log('Departure date value:', formData.departureDate.toString());
  //     console.log('Departure date toDateString:', formData.departureDate.toDateString());
  //   }
  //   if (formData.returnDate) {
  //     console.log('Return date type:', typeof formData.returnDate);
  //     console.log('Return date instanceof Date:', formData.returnDate instanceof Date);
  //     console.log('Return date value:', formData.returnDate.toString());
  //     console.log('Return date toDateString:', formData.returnDate.toDateString());
  //   }
  // }, [formData]);

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
      onSearch(formData);
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
          One Way
        </button>
        <button
          className={`tab-button ${formData.tripType === 'roundtrip' ? 'active' : ''}`}
          onClick={() => handleChange('tripType', 'roundtrip')}
        >
          Round Trip
        </button>
      </div>

      <Form onSubmit={handleSubmit} layout="vertical">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label required">From</label>
            <Select
              value={formData.from}
              onChange={(value) => handleChange('from', value)}
              placeholder="Select departure city"
              options={cities}
              showSearch
              noMatchText="No matching departure cities found"
            />
            {!formData.from && <div className="error-message">Please select departure city</div>}
          </div>

          <div className="swap-button-container">
            <button
              type="button"
              className="swap-button"
              onClick={handleSwapCities}
              title="Swap cities"
            >
              ⇄
            </button>
          </div>

          <div className="form-field">
            <label className="form-label required">To</label>
            <Select
              value={formData.to}
              onChange={(value) => handleChange('to', value)}
              placeholder="Select destination city"
              options={cities}
              showSearch
              noMatchText="No matching destination cities found"
              loading={loading}
            />
            {!formData.to && <div className="error-message">Please select destination city</div>}
          </div>
        </div>

        <div className="form-row">
          <FormItem
            label="Departure Date"
            required
            error={!formData.departureDate ? 'Please select departure date' : ''}
            className="form-item-date"
          >
            <DatePicker
              value={formData.departureDate}
              onChange={(date) => handleChange('departureDate', date)}
              placeholder="Select departure date"
              disabledDate={(current) => {
                // 直接使用current，它应该已经是Date对象
                return current && current < today;
              }}
            />
          </FormItem>

          {formData.tripType === 'roundtrip' && (
            <FormItem
              label="Return Date"
              required
              error={!formData.returnDate ? 'Please select return date' : ''}
              className="form-item-date"
            >
              <DatePicker
                value={formData.returnDate}
                onChange={(date) => handleChange('returnDate', date)}
                placeholder="Select return date"
                disabledDate={(current) => {
                  // 直接使用current，它应该已经是Date对象
                  const departureDate = formData.departureDate || today;
                  return current && current < departureDate;
                }}
              />
            </FormItem>
          )}
        </div>

        <div className="form-row">
          <FormItem
            label="Passengers"
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
            <label className="form-label required">Class</label>
            <Select
              value={formData.class}
              onChange={(value) => handleChange('class', value)}
              placeholder="Select cabin class"
              options={CABIN_CLASSES}
              showSearch
              noMatchText="No matching cabin classes found"
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
            Search Flights
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default FlightSearchForm;
