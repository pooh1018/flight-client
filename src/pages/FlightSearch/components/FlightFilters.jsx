import React from 'react';
import { Form } from '@/components/ui/Form';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const FlightFilters = ({ onFilter, loading }) => {
  const [form] = Form.useForm();

  const timeRanges = [
    { value: 'all', label: 'All Times' },
    { value: 'morning', label: 'Morning (6:00-12:00)' },
    { value: 'afternoon', label: 'Afternoon (12:00-18:00)' },
    { value: 'evening', label: 'Evening (18:00-24:00)' },
    { value: 'night', label: 'Night (0:00-6:00)' }
  ];

  const cabinClasses = [
    { value: 'all', label: 'All Classes' },
    { value: '1', label: 'Economy' },
    { value: '2', label: 'Premium Economy' },
    { value: '3', label: 'Business' },
    { value: '4', label: 'First Class' }
  ];

  const handleFilter = () => {
    const values = form.getFieldsValue();
    onFilter(values);
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  return (
    <Card className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFilter}
        initialValues={{
          timeRange: 'all',
          cabinClass: 'all',
          priceRange: [0, 10000],
          minSeats: 1
        }}
      >
        <Form.Item label="Time Range" name="timeRange">
          <Select
            options={timeRanges}
            placeholder="Select time range"
          />
        </Form.Item>

        <Form.Item label="Cabin Class" name="cabinClass">
          <Select
            options={cabinClasses}
            placeholder="Select cabin class"
          />
        </Form.Item>

        <Form.Item label="Price Range" name="priceRange">
          <Slider
            range
            min={0}
            max={10000}
            step={100}
            marks={{
              0: '¥0',
              2500: '¥2.5k',
              5000: '¥5k',
              7500: '¥7.5k',
              10000: '¥10k'
            }}
          />
        </Form.Item>

        <Form.Item label="Minimum Available Seats" name="minSeats">
          <Slider
            min={1}
            max={10}
            marks={{
              1: '1',
              5: '5',
              10: '10+'
            }}
          />
        </Form.Item>

        <div className="flex gap-2">
          <Button type="primary" onClick={handleFilter} loading={loading}>
            Apply Filters
          </Button>
          <Button onClick={handleReset} disabled={loading}>
            Reset
          </Button>
        </div>
      </Form>
    </Card>
  );
};

FlightFilters.defaultProps = {
  onFilter: () => {},
  loading: false
};

export default FlightFilters;
