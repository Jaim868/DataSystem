/**
 * 格式化日期时间为本地字符串
 * @param date 日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}; 