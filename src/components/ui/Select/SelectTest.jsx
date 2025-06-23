import React, { useState } from 'react';
import { Select } from '@/components/ui';

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
  { value: '3', label: '选项 3' },
  { value: '4', label: '选项 4' },
  { value: '5', label: '选项 5' },
  { value: '6', label: '选项 6' },
  { value: '7', label: '选项 7' },
  { value: '8', label: '选项 8' },
  { value: '9', label: '选项 9' },
  { value: '10', label: '选项 10' },
];

const SelectTest = () => {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Select 组件测试</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>基本使用</h3>
        <Select
          options={options}
          value={value}
          onChange={setValue}
          placeholder="请选择一个选项"
        />
        <p>当前选中值: {value}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>带搜索功能</h3>
        <Select
          options={options}
          showSearch
          placeholder="请搜索并选择"
          noMatchText="没有找到匹配项"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>自定义无匹配文本</h3>
        <Select
          options={[]}
          showSearch
          placeholder="这里没有选项"
          noMatchText="列表为空，请添加选项"
        />
      </div>

      <div>
        <h3>键盘导航测试</h3>
        <p>使用上下箭头键导航选项，按回车键选择高亮的选项</p>
        <Select
          options={options}
          placeholder="使用键盘导航"
        />
      </div>
    </div>
  );
};

export default SelectTest;
