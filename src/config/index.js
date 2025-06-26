import { getAllAirports } from '@/services/airportApi';

// 获取机场数据并格式化为Select组件需要的格式
export const fetchAirportData = async () => {
  try {
    const response = await getAllAirports();
    return response.data.map(airport => ({
      key: airport.airportId, // 使用 airportId 作为唯一 key
      value: airport.airportId,
      label: `${airport.city} (${airport.airportCode}) - ${airport.country}`,
      city: airport.city,
      airportName: airport.airportName,
      country: airport.country
    }));
  } catch (error) {
    console.error('Failed to fetch airports:', error);
    throw error;
  }
};

/**
 * 热门城市列表
 */
export const POPULAR_CITIES = [
  { name: '北京', code: 'PEK', country: '中国' },
  { name: '上海', code: 'SHA', country: '中国' },
  { name: '广州', code: 'CAN', country: '中国' },
  { name: '深圳', code: 'SZX', country: '中国' },
  { name: '成都', code: 'CTU', country: '中国' },
  { name: '杭州', code: 'HGH', country: '中国' },
  { name: '重庆', code: 'CKG', country: '中国' },
  { name: '西安', code: 'XIY', country: '中国' },
  { name: '南京', code: 'NKG', country: '中国' },
  { name: '武汉', code: 'WUH', country: '中国' },
  { name: '厦门', code: 'XMN', country: '中国' },
  { name: '长沙', code: 'CSX', country: '中国' },
  { name: '昆明', code: 'KMG', country: '中国' },
  { name: '青岛', code: 'TAO', country: '中国' },
  { name: '三亚', code: 'SYX', country: '中国' },
  { name: '香港', code: 'HKG', country: '中国' },
  { name: '台北', code: 'TPE', country: '中国台湾' },
  { name: '东京', code: 'TYO', country: '日本' },
  { name: '大阪', code: 'OSA', country: '日本' },
  { name: '首尔', code: 'SEL', country: '韩国' },
  { name: '新加坡', code: 'SIN', country: '新加坡' },
  { name: '曼谷', code: 'BKK', country: '泰国' },
  { name: '吉隆坡', code: 'KUL', country: '马来西亚' },
  { name: '悉尼', code: 'SYD', country: '澳大利亚' },
  { name: '伦敦', code: 'LON', country: '英国' },
  { name: '巴黎', code: 'PAR', country: '法国' },
  { name: '纽约', code: 'NYC', country: '美国' },
  { name: '洛杉矶', code: 'LAX', country: '美国' },
  { name: '温哥华', code: 'YVR', country: '加拿大' },
  { name: '多伦多', code: 'YTO', country: '加拿大' }
];

/**
 * 航空公司信息
 */
export const AIRLINES = [
  { code: 'CA', name: '中国国际航空', logo: 'src/assets/images/airlines/ca.png' },
  { code: 'MU', name: '中国东方航空', logo: 'src/assets/images/airlines/mu.png' },
  { code: 'CZ', name: '中国南方航空', logo: 'src/assets/images/airlines/cz.png' },
  { code: 'HU', name: '海南航空', logo: 'src/assets/images/airlines/hu.png' },
  { code: '3U', name: '四川航空', logo: 'src/assets/images/airlines/3u.png' },
  { code: 'MF', name: '厦门航空', logo: 'src/assets/images/airlines/mf.png' },
  { code: 'ZH', name: '深圳航空', logo: 'src/assets/images/airlines/zh.png' },
  { code: 'FM', name: '上海航空', logo: 'src/assets/images/airlines/fm.png' },
  { code: 'JD', name: '首都航空', logo: 'src/assets/images/airlines/jd.png' },
  { code: 'GS', name: '天津航空', logo: 'src/assets/images/airlines/gs.png' },
  { code: 'SC', name: '山东航空', logo: 'src/assets/images/airlines/sc.png' },
  { code: 'KN', name: '中国联合航空', logo: 'src/assets/images/airlines/kn.png' },
  { code: 'CX', name: '国泰航空', logo: 'src/assets/images/airlines/cx.png' },
  { code: 'KA', name: '国泰港龙航空', logo: 'src/assets/images/airlines/ka.png' },
  { code: 'BR', name: '长荣航空', logo: 'src/assets/images/airlines/br.png' },
  { code: 'CI', name: '中华航空', logo: 'src/assets/images/airlines/ci.png' },
  { code: 'JL', name: '日本航空', logo: 'src/assets/images/airlines/jl.png' },
  { code: 'NH', name: '全日空', logo: 'src/assets/images/airlines/nh.png' },
  { code: 'KE', name: '大韩航空', logo: 'src/assets/images/airlines/ke.png' },
  { code: 'OZ', name: '韩亚航空', logo: 'src/assets/images/airlines/oz.png' },
  { code: 'SQ', name: '新加坡航空', logo: 'src/assets/images/airlines/sq.png' },
  { code: 'TG', name: '泰国航空', logo: 'src/assets/images/airlines/tg.png' },
  { code: 'MH', name: '马来西亚航空', logo: 'src/assets/images/airlines/mh.png' },
  { code: 'QF', name: '澳洲航空', logo: 'src/assets/images/airlines/qf.png' },
  { code: 'BA', name: '英国航空', logo: 'src/assets/images/airlines/ba.png' },
  { code: 'AF', name: '法国航空', logo: 'src/assets/images/airlines/af.png' },
  { code: 'LH', name: '汉莎航空', logo: 'src/assets/images/airlines/lh.png' },
  { code: 'UA', name: '美国联合航空', logo: 'src/assets/images/airlines/ua.png' },
  { code: 'AA', name: '美国航空', logo: 'src/assets/images/airlines/aa.png' },
  { code: 'DL', name: '达美航空', logo: 'src/assets/images/airlines/dl.png' },
  { code: 'AC', name: '加拿大航空', logo: 'src/assets/images/airlines/ac.png' },
  { code: '99', name: '某大航空', logo: 'src/assets/images/airlines/99.png' }
];

/**
 * 根据航空公司代码获取航空公司信息
 * @param {string} code - 航空公司代码
 * @returns {Object|null} 航空公司信息
 */
export const getAirlineByCode = (code) => {
  return AIRLINES.find(airline => airline.code === code) || null;
};

/**
 * 舱位类型
 */
export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy', description: '经济实惠的标准座位' },
  { value: 'premium_economy', label: 'Premium Economy', description: '更宽敞的座位和更好的服务' },
  { value: 'business', label: 'Business', description: '豪华座椅和优质服务' },
  { value: 'first', label: 'First Class', description: '最高级别的舒适和服务' }
];

/**
 * 支付方式
 */
export const PAYMENT_METHODS = [
  { value: 'alipay', label: '支付宝', icon: 'alipay' },
  { value: 'wechat', label: '微信支付', icon: 'wechat' },
  { value: 'creditcard', label: '信用卡', icon: 'credit-card' },
  { value: 'unionpay', label: '银联', icon: 'unionpay' }
];

/**
 * 订单状态
 */
export const ORDER_STATUS = [
  { value: 'pending', label: '待支付', color: 'warning' },
  { value: 'paid', label: '已支付', color: 'success' },
  { value: 'confirmed', label: '预定成功', color: 'success' },
  { value: 'cancelled', label: '已取消', color: 'danger' },
  { value: 'refunded', label: '已退款', color: 'info' },
  { value: 'completed', label: '已完成', color: 'success' }
];

/**
 * 国家/地区选项
 */
export const COUNTRY_OPTIONS = [
  { label: '中国', value: 'China' },
  { label: '美国', value: 'USA' },
  { label: '英国', value: 'UK' },
  { label: '日本', value: 'Japan' },
  { label: '韩国', value: 'South Korea' },
  { label: '新加坡', value: 'Singapore' },
  { label: '马来西亚', value: 'Malaysia' },
  { label: '泰国', value: 'Thailand' },
  { label: '越南', value: 'Vietnam' },
  { label: '印度', value: 'India' },
  { label: '澳大利亚', value: 'Australia' },
  { label: '新西兰', value: 'New Zealand' },
  { label: '加拿大', value: 'Canada' },
  { label: '法国', value: 'France' },
  { label: '德国', value: 'Germany' },
  { label: '意大利', value: 'Italy' },
  { label: '西班牙', value: 'Spain' },
  { label: '葡萄牙', value: 'Portugal' },
  { label: '俄罗斯', value: 'Russia' },
  { label: '巴西', value: 'Brazil' },
  { label: '墨西哥', value: 'Mexico' },
  { label: '阿根廷', value: 'Argentina' },
  { label: '南非', value: 'South Africa' },
  { label: '埃及', value: 'Egypt' },
  { label: '阿联酋', value: 'United Arab Emirates' }
];

/**
 * 时间段选项
 */
export const TIME_SLOTS = [
  { value: 'dawn', label: '凌晨（00:00-06:00）' },
  { value: 'morning', label: '上午（06:00-12:00）' },
  { value: 'afternoon', label: '下午（12:00-18:00）' },
  { value: 'evening', label: '晚上（18:00-24:00）' }
];

/**
 * 经停次数选项
 */
export const STOP_OPTIONS = [
  { value: '0', label: '直飞', description: '无经停' },
  { value: '1', label: '1次经停', description: '1次中转' },
  { value: '2+', label: '多次经停', description: '2次或更多中转' }
];

/**
 * API基础URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

/**
 * 主题配置
 */
export const THEMES = {
  light: {
    '--primary-color': '#1890ff',
    '--secondary-color': '#40a9ff',
    '--success-color': '#52c41a',
    '--warning-color': '#faad14',
    '--error-color': '#f5222d',
    '--info-color': '#1890ff',
    '--primary-color-light': '#e6f7ff',
    '--primary-color-dark': '#096dd9',
    '--success-color-light': '#f6ffed',
    '--warning-color-light': '#fffbe6',
    '--danger-color-light': '#fff1f0',
    '--info-color-light': '#e6f7ff',
    '--heading-color': '#333',
    '--text-color': 'rgba(0, 0, 0, 0.85)',
    '--text-color-secondary': 'rgba(0, 0, 0, 0.45)',
    '--disabled-color': 'rgba(0, 0, 0, 0.25)',
    '--text-primary': '#262626',
    '--text-secondary': '#595959',
    '--text-disabled': '#bfbfbf',
    '--bg-light': '#f5f5f5',
    '--bg-white': '#ffffff',
    '--border-color': '#e8e8e8',
    '--box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  dark: {
    '--primary-color': '#177ddc',
    '--secondary-color': '#1890ff',
    '--success-color': '#49aa19',
    '--warning-color': '#d89614',
    '--error-color': '#a61d24',
    '--info-color': '#177ddc',
    '--primary-color-light': '#153450',
    '--primary-color-dark': '#096dd9',
    '--success-color-light': '#162312',
    '--warning-color-light': '#2b2111',
    '--danger-color-light': '#2a1215',
    '--info-color-light': '#153450',
    '--heading-color': '#e6e6e6',
    '--text-color': '#d9d9d9',
    '--text-color-secondary': '#8c8c8c',
    '--disabled-color': 'rgba(255, 255, 255, 0.25)',
    '--text-dark-primary': '#ffffff',
    '--text-dark-secondary': '#b3b3b3',
    '--text-dark-disabled': '#595959',
    '--bg-dark': '#141414',
    '--bg-dark-light': '#1f1f1f',
    '--bg-dark-hover': '#303030',
    '--border-color': '#434343',
    '--border-dark': '#434343',
    '--box-shadow': '0 2px 8px rgba(0, 0, 0, 0.45)',
    '--box-shadow-dark': '0 2px 8px rgba(0, 0, 0, 0.45)'
  }
};

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  pageSize: 10,
  currentPage: 1,
  total: 0
};

/**
 * 应用程序配置
 */
export const APP_CONFIG = {
  name: '航班搜索系统',
  version: '1.0.0',
  description: '一个简单的航班搜索和预订系统',
  copyright: `© ${new Date().getFullYear()} 航班搜索系统`,
  contactEmail: 'support@flightsearch.example.com',
  supportPhone: '+86 123 4567 8901'
};

export default {
  POPULAR_CITIES,
  AIRLINES,
  getAirlineByCode,
  CABIN_CLASSES,
  PAYMENT_METHODS,
  ORDER_STATUS,
  TIME_SLOTS,
  STOP_OPTIONS,
  API_BASE_URL,
  THEMES,
  DEFAULT_PAGINATION,
  APP_CONFIG
};
