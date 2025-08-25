/**
 * API 配置文件
 * 集中管理API相关的配置选项
 */

// API配置
const API_CONFIG = {
  // 主服务地址
  BASE_URL: 'https://ai.fenzhidao.com/pronunciation',
  
  // 备用服务地址（如果主服务不可用）
  FALLBACK_URLS: [
    // 可以添加其他备用地址
  ],
  
  // 请求超时配置
  TIMEOUT: {
    DEFAULT: 10000,      // 默认10秒
    AUDIO: 15000,        // 音频请求15秒
    ANALYSIS: 20000      // 完整分析20秒
  },
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,     // 最大重试次数
    INITIAL_DELAY: 1000, // 初始延迟1秒
    MAX_DELAY: 10000     // 最大延迟10秒
  },
  
  // 缓存配置
  CACHE: {
    ENABLED: true,       // 是否启用缓存
    DURATION: 300000,    // 缓存5分钟
    MAX_ENTRIES: 100     // 最大缓存条目
  },
  
  // 功能开关
  FEATURES: {
    USE_LOCAL_FALLBACK: true,  // 使用本地回退数据
    ENABLE_AUDIO: true,        // 启用音频功能
    ENABLE_CACHE: true,        // 启用缓存
    AUTO_RETRY: true           // 自动重试
  }
};

// 缓存管理器
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, value, duration = API_CONFIG.CACHE.DURATION) {
    if (!API_CONFIG.FEATURES.ENABLE_CACHE) return;
    
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + duration);
    
    // 清理过期缓存
    this.cleanup();
  }

  get(key) {
    if (!API_CONFIG.FEATURES.ENABLE_CACHE) return null;
    
    const expiry = this.timestamps.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.timestamps.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
    
    // 限制缓存大小
    if (this.cache.size > API_CONFIG.CACHE.MAX_ENTRIES) {
      const entries = Array.from(this.timestamps.entries())
        .sort(([,a], [,b]) => a - b)
        .slice(0, Math.floor(API_CONFIG.CACHE.MAX_ENTRIES * 0.8));
      
      this.cache.clear();
      this.timestamps.clear();
      
      entries.forEach(([key, expiry]) => {
        if (this.cache.has(key)) {
          this.timestamps.set(key, expiry);
        }
      });
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      timestamps: this.timestamps.size,
      enabled: API_CONFIG.FEATURES.ENABLE_CACHE
    };
  }
}

// 错误处理器
class ErrorHandler {
  static handle(error, context = '') {
    const errorInfo = {
      message: error.message || '未知错误',
      context,
      timestamp: new Date().toISOString(),
      type: this.getErrorType(error)
    };

    console.error(`[API Error] ${context}:`, errorInfo);

    // 根据错误类型返回用户友好的消息
    switch (errorInfo.type) {
      case 'NETWORK':
        return '网络连接异常，请检查网络设置';
      case 'TIMEOUT':
        return '请求超时，请重试';
      case 'SERVER':
        return '服务器繁忙，请稍后重试';
      case 'DATA':
        return '数据格式错误';
      default:
        return '操作失败，请重试';
    }
  }

  static getErrorType(error) {
    if (error.message.includes('网络') || error.message.includes('Network')) {
      return 'NETWORK';
    }
    if (error.message.includes('超时') || error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (error.message.includes('500') || error.message.includes('服务器')) {
      return 'SERVER';
    }
    if (error.message.includes('400') || error.message.includes('数据')) {
      return 'DATA';
    }
    return 'UNKNOWN';
  }
}

// 性能监控器
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      successCount: 0,
      errorCount: 0,
      totalTime: 0,
      averageTime: 0
    };
  }

  startRequest() {
    return {
      startTime: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  endRequest(requestInfo, success = true) {
    const duration = Date.now() - requestInfo.startTime;
    
    this.metrics.requests++;
    this.metrics.totalTime += duration;
    this.metrics.averageTime = this.metrics.totalTime / this.metrics.requests;
    
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    console.log(`[Performance] Request ${requestInfo.id}: ${duration}ms (${success ? 'SUCCESS' : 'ERROR'})`);
  }

  getStats() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests > 0 ? (this.metrics.successCount / this.metrics.requests * 100).toFixed(1) + '%' : '0%'
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      successCount: 0,
      errorCount: 0,
      totalTime: 0,
      averageTime: 0
    };
  }
}

// 创建全局实例
const cacheManager = new CacheManager();
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  API_CONFIG,
  CacheManager,
  ErrorHandler,
  PerformanceMonitor,
  cacheManager,
  performanceMonitor
};