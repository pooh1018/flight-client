/**
 * 本地存储键名常量
 */
const STORAGE_KEYS = {
  SEARCH_HISTORY: 'flight_search_history',
  USER_PREFERENCES: 'flight_user_preferences',
  RECENT_VIEWED: 'flight_recent_viewed',
  AUTH_TOKEN: 'flight_auth_token',
  USER_INFO: 'flight_user_info',
  THEME: 'flight_theme',
  LANGUAGE: 'flight_language'
};

/**
 * 设置本地存储项
 * @param {string} key - 存储键名
 * @param {*} value - 存储值
 */
const setItem = (key, value) => {
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(key, serializedValue);
    console.log('Token saved successfully');
  } catch (error) {
    console.error(`存储数据失败 [${key}]:`, error);
  }
};

/**
 * 获取本地存储项
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储值或默认值
 */
const getItem = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      // 如果不是JSON格式，直接返回原始值
      return value;
    }
  } catch (error) {
    console.error(`获取数据失败 [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * 移除本地存储项
 * @param {string} key - 存储键名
 */
const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`移除数据失败 [${key}]:`, error);
  }
};

/**
 * 清空本地存储
 */
const clear = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空存储失败:', error);
  }
};

/**
 * 保存搜索历史
 * @param {Object} searchParams - 搜索参数
 * @param {number} maxItems - 最大保存数量，默认为10
 */
export const saveSearchHistory = (searchParams, maxItems = 10) => {
  try {
    const history = getSearchHistory();
    const newSearch = {
      ...searchParams,
      timestamp: new Date().toISOString()
    };

    // 检查是否已存在相同的搜索记录
    const existingIndex = history.findIndex(item =>
      item.from === searchParams.from &&
      item.to === searchParams.to &&
      item.tripType === searchParams.tripType &&
      (item.dates && searchParams.dates &&
        item.dates[0]?.getTime() === searchParams.dates[0]?.getTime() &&
        (item.tripType !== 'roundTrip' ||
          item.dates[1]?.getTime() === searchParams.dates[1]?.getTime()))
    );

    if (existingIndex !== -1) {
      // 如果存在，更新时间戳并移到最前面
      history.splice(existingIndex, 1);
    }

    // 添加到最前面
    history.unshift(newSearch);

    // 只保留指定数量的记录
    const updatedHistory = history.slice(0, maxItems);

    setItem(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
  } catch (error) {
    console.error('保存搜索历史失败:', error);
  }
};

/**
 * 添加搜索历史（兼容旧版本）
 * @param {Object} searchParams - 搜索参数
 * @param {number} maxItems - 最大保存数量，默认为10
 */
export const addSearchHistory = saveSearchHistory;

/**
 * 获取搜索历史
 * @returns {Array} 搜索历史记录数组
 */
export const getSearchHistory = () => {
  return getItem(STORAGE_KEYS.SEARCH_HISTORY, []);
};

/**
 * 清除搜索历史
 */
export const clearSearchHistory = () => {
  removeItem(STORAGE_KEYS.SEARCH_HISTORY);
};

/**
 * 保存用户偏好设置
 * @param {Object} preferences - 用户偏好设置
 */
export const saveUserPreferences = (preferences) => {
  const currentPreferences = getUserPreferences();
  setItem(STORAGE_KEYS.USER_PREFERENCES, {
    ...currentPreferences,
    ...preferences
  });
};

/**
 * 获取用户偏好设置
 * @returns {Object} 用户偏好设置对象
 */
export const getUserPreferences = () => {
  return getItem(STORAGE_KEYS.USER_PREFERENCES, {});
};

/**
 * 添加最近查看的航班
 * @param {Object} flight - 航班信息
 * @param {number} maxItems - 最大保存数量，默认为20
 */
export const addRecentViewedFlight = (flight, maxItems = 20) => {
  try {
    const recentViewed = getRecentViewedFlights();

    // 检查是否已存在相同的航班
    const existingIndex = recentViewed.findIndex(item => item.id === flight.id);

    if (existingIndex !== -1) {
      // 如果存在，移到最前面
      recentViewed.splice(existingIndex, 1);
    }

    // 添加到最前面
    recentViewed.unshift({
      ...flight,
      viewedAt: new Date().toISOString()
    });

    // 只保留指定数量的记录
    const updatedRecentViewed = recentViewed.slice(0, maxItems);

    setItem(STORAGE_KEYS.RECENT_VIEWED, updatedRecentViewed);
  } catch (error) {
    console.error('保存最近查看航班失败:', error);
  }
};

/**
 * 获取最近查看的航班
 * @returns {Array} 最近查看的航班数组
 */
export const getRecentViewedFlights = () => {
  return getItem(STORAGE_KEYS.RECENT_VIEWED, []);
};

/**
 * 清除最近查看的航班
 */
export const clearRecentViewedFlights = () => {
  removeItem(STORAGE_KEYS.RECENT_VIEWED);
};

/**
 * 保存认证令牌
 * @param {string} token - 认证令牌
 */
export const saveAuthToken = (token) => {
  setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * 获取认证令牌
 * @returns {string|null} 认证令牌
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN, null);
};

/**
 * 移除认证令牌
 */
export const removeAuthToken = () => {
  removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * 保存用户信息
 * @param {Object} userInfo - 用户信息
 */
export const saveUserInfo = (userInfo) => {
  setItem(STORAGE_KEYS.USER_INFO, userInfo);
};

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息
 */
export const getUserInfo = () => {
  return getItem(STORAGE_KEYS.USER_INFO, null);
};

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  removeItem(STORAGE_KEYS.USER_INFO);
};

/**
 * 保存主题设置
 * @param {string} theme - 主题名称 ('light' 或 'dark')
 */
export const saveTheme = (theme) => {
  setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * 获取主题设置
 * @returns {string} 主题名称，默认为 'light'
 */
export const getTheme = () => {
  return getItem(STORAGE_KEYS.THEME, 'light');
};

/**
 * 保存语言设置
 * @param {string} language - 语言代码
 */
export const saveLanguage = (language) => {
  setItem(STORAGE_KEYS.LANGUAGE, language);
};

/**
 * 获取语言设置
 * @returns {string} 语言代码，默认为 'zh-CN'
 */
export const getLanguage = () => {
  return getItem(STORAGE_KEYS.LANGUAGE, 'en');
};

export default {
  setItem,
  getItem,
  removeItem,
  clear,
  saveSearchHistory,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  saveUserPreferences,
  getUserPreferences,
  addRecentViewedFlight,
  getRecentViewedFlights,
  clearRecentViewedFlights,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserInfo,
  getUserInfo,
  removeUserInfo,
  saveTheme,
  getTheme,
  saveLanguage,
  getLanguage
};
