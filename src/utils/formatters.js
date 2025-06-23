/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {string} currency - 货币符号，默认为 ¥
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price, currency = '¥') => {
  if (price === undefined || price === null) return `${currency}0`;

  return `${currency}${price.toLocaleString('zh-CN')}`;
};

/**
 * 格式化日期
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} format - 格式化模式，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化时间
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串 (HH:mm)
 */
export const formatTime = (time) => {
  if (!time) return '';

  const d = typeof time === 'string' ? new Date(time) : time;

  if (isNaN(d.getTime())) return '';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * 格式化持续时间（分钟转为小时和分钟）
 * @param {number} minutes - 总分钟数
 * @returns {string} 格式化后的持续时间字符串
 */
export const formatDuration = (minutes) => {
  if (minutes === undefined || minutes === null || isNaN(minutes)) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}分钟`;
  } else if (mins === 0) {
    return `${hours}小时`;
  } else {
    return `${hours}小时${mins}分钟`;
  }
};

/**
 * 格式化航班号
 * @param {string} airlineCode - 航空公司代码
 * @param {string|number} flightNumber - 航班号
 * @returns {string} 格式化后的航班号
 */
export const formatFlightNumber = (airlineCode, flightNumber) => {
  if (!airlineCode || !flightNumber) return '';

  return `${airlineCode} ${flightNumber}`;
};

/**
 * 格式化座位类型
 * @param {string} cabinClass - 座位类型代码
 * @returns {string} 格式化后的座位类型名称
 */
export const formatCabinClass = (cabinClass) => {
  switch (cabinClass) {
    case 'economy':
      return '经济舱';
    case 'premium':
      return '高级经济舱';
    case 'business':
      return '商务舱';
    case 'first':
      return '头等舱';
    default:
      return cabinClass || '';
  }
};

/**
 * 格式化乘客类型
 * @param {string} passengerType - 乘客类型代码
 * @returns {string} 格式化后的乘客类型名称
 */
export const formatPassengerType = (passengerType) => {
  switch (passengerType) {
    case 'adult':
      return '成人';
    case 'child':
      return '儿童';
    case 'infant':
      return '婴儿';
    default:
      return passengerType || '';
  }
};

/**
 * 格式化支付方式
 * @param {string} paymentMethod - 支付方式代码
 * @returns {string} 格式化后的支付方式名称
 */
export const formatPaymentMethod = (paymentMethod) => {
  switch (paymentMethod) {
    case 'alipay':
      return '支付宝';
    case 'wechat':
      return '微信支付';
    case 'creditcard':
      return '信用卡';
    case 'unionpay':
      return '银联';
    default:
      return paymentMethod || '';
  }
};

/**
 * 格式化订单状态
 * @param {string} status - 订单状态代码
 * @returns {string} 格式化后的订单状态名称
 */
export const formatOrderStatus = (status) => {
  switch (status) {
    case 'pending':
      return '待支付';
    case 'paid':
      return '已支付';
    case 'confirmed':
      return '已确认';
    case 'cancelled':
      return '已取消';
    case 'refunded':
      return '已退款';
    case 'completed':
      return '已完成';
    default:
      return status || '';
  }
};
