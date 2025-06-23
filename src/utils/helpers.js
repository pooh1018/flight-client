/**
 * 从URL查询字符串中获取搜索参数
 * @param {string} search - URL查询字符串
 * @returns {Object} 解析后的搜索参数对象
 */
export const getSearchParams = (search) => {
  const params = new URLSearchParams(search);
  const searchParams = {};

  for (const [key, value] of params.entries()) {
    searchParams[key] = value;
  }

  return searchParams;
};

/**
 * 获取时间段
 * @param {Date} date - 日期对象
 * @returns {string} 时间段标识
 */
export const getTimeSlot = (date) => {
  const hours = date.getHours();

  if (hours >= 0 && hours < 6) {
    return 'dawn'; // 凌晨（00:00-06:00）
  } else if (hours >= 6 && hours < 12) {
    return 'morning'; // 上午（06:00-12:00）
  } else if (hours >= 12 && hours < 18) {
    return 'afternoon'; // 下午（12:00-18:00）
  } else {
    return 'evening'; // 晚上（18:00-24:00）
  }
};

/**
 * 获取时间段显示名称
 * @param {string} slot - 时间段标识
 * @returns {string} 时间段显示名称
 */
export const getTimeSlotName = (slot) => {
  switch (slot) {
    case 'dawn':
      return '凌晨（00:00-06:00）';
    case 'morning':
      return '上午（06:00-12:00）';
    case 'afternoon':
      return '下午（12:00-18:00）';
    case 'evening':
      return '晚上（18:00-24:00）';
    default:
      return '';
  }
};

/**
 * 保存搜索历史到本地存储
 * @param {Object} searchParams - 搜索参数
 */
export const addSearchHistory = (searchParams) => {
  try {
    const history = getSearchHistory();
    const newSearch = {
      ...searchParams,
      timestamp: new Date().toISOString()
    };

    // 检查是否已存在相同的搜索记录
    const existingIndex = history.findIndex(item =>
      item.departureCity === searchParams.departureCity &&
      item.arrivalCity === searchParams.arrivalCity &&
      item.departureDate === searchParams.departureDate &&
      item.returnDate === searchParams.returnDate
    );

    if (existingIndex !== -1) {
      // 如果存在，更新时间戳
      history[existingIndex].timestamp = newSearch.timestamp;
    } else {
      // 如果不存在，添加新记录
      history.unshift(newSearch);
    }

    // 只保留最近10条记录
    const updatedHistory = history.slice(0, 10);

    localStorage.setItem('flightSearchHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('保存搜索历史失败:', error);
  }
};

/**
 * 获取搜索历史
 * @returns {Array} 搜索历史记录数组
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('flightSearchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    return [];
  }
};

/**
 * 清除搜索历史
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('flightSearchHistory');
  } catch (error) {
    console.error('清除搜索历史失败:', error);
  }
};

/**
 * 保存用户偏好设置
 * @param {Object} preferences - 用户偏好设置
 */
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem('flightUserPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('保存用户偏好设置失败:', error);
  }
};

/**
 * 获取用户偏好设置
 * @returns {Object} 用户偏好设置对象
 */
export const getUserPreferences = () => {
  try {
    const preferences = localStorage.getItem('flightUserPreferences');
    return preferences ? JSON.parse(preferences) : {};
  } catch (error) {
    console.error('获取用户偏好设置失败:', error);
    return {};
  }
};

/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 节流函数
 * @param {Function} func - 需要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * 深拷贝对象
 * @param {*} obj - 需要深拷贝的对象
 * @returns {*} 深拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }

  return obj;
};
