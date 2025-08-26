/**
 * 自然拼读和音节拆分 API 客户端
 * 基于 https://ai.fenzhidao.com/pronunciation 服务
 */

const API_BASE_URL = 'https://ai.fenzhidao.com/pronunciation';

class PhonicsAPIClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * 发送网络请求的通用方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} API响应数据
   */
  async request(url, options = {}) {
    const defaultOptions = {
      timeout: 10000, // 10秒超时
      header: {
        'Content-Type': 'application/json'
      }
    };

    const requestOptions = Object.assign({}, defaultOptions, options);

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header: requestOptions.header,
        timeout: requestOptions.timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`API请求失败: ${res.statusCode} - ${(res.data && res.data.error) || '未知错误'}`));
          }
        },
        fail: (err) => {
          console.error('Network request failed:', err);
          reject(new Error(`网络请求失败: ${err.errMsg || '网络连接异常'}`));
        }
      });
    });
  }

  /**
   * 单词拆分 - 主要的拆分服务
   * @param {string} word - 要拆分的英语单词
   * @param {Object} options - 拆分选项
   * @returns {Promise} 拆分结果
   */
  async splitWord(word, options = {}) {
    const splitTypes = options.splitTypes || ['syllable', 'phoneme_basic'];
    const generateAudio = options.generateAudio || false;
    const audioType = options.audioType || 'combined';

    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const requestData = {
      word: word.toLowerCase().trim(),
      split_types: splitTypes,
      generate_audio: generateAudio,
      audio_type: audioType
    };

    try {
      const response = await this.request(`${this.baseUrl}/api/split`, {
        method: 'POST',
        data: requestData
      });

      return response;
    } catch (error) {
      console.error('Split word API error:', error);
      throw error;
    }
  }

  /**
   * 音节拆分 - 简化端点
   * @param {string} word - 要拆分的英语单词
   * @returns {Promise} 音节拆分结果
   */
  async getSyllables(word) {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    try {
      const response = await this.request(`${this.baseUrl}/api/syllables/${encodeURIComponent(word.toLowerCase().trim())}`);
      return response;
    } catch (error) {
      console.error('Get syllables API error:', error);
      throw error;
    }
  }

  /**
   * 音素拆分 - 简化端点
   * @param {string} word - 要拆分的英语单词
   * @returns {Promise} 音素拆分结果
   */
  async getPhonemes(word) {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    try {
      const response = await this.request(`${this.baseUrl}/api/phonemes/${encodeURIComponent(word.toLowerCase().trim())}`);
      return response;
    } catch (error) {
      console.error('Get phonemes API error:', error);
      throw error;
    }
  }

  /**
   * 音频生成 - 为单词生成音频文件
   * @param {string} word - 要生成音频的英语单词
   * @returns {Promise} 音频数据
   */
  async getAudio(word) {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    try {
      const response = await this.request(`${this.baseUrl}/api/audio/${encodeURIComponent(word.toLowerCase().trim())}`);
      return response;
    } catch (error) {
      console.error('Get audio API error:', error);
      throw error;
    }
  }

  /**
   * 完整分析 - 对单词进行全面分析
   * @param {string} word - 要分析的英语单词
   * @param {boolean} includeAudio - 是否包含音频
   * @returns {Promise} 完整分析结果
   */
  async analyzeWord(word, includeAudio = false) {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const requestData = {
      word: word.toLowerCase().trim(),
      include_audio: includeAudio
    };

    try {
      const response = await this.request(`${this.baseUrl}/api/analyze`, {
        method: 'POST',
        data: requestData
      });

      return response;
    } catch (error) {
      console.error('Analyze word API error:', error);
      throw error;
    }
  }

  /**
   * 健康检查 - 检查服务状态
   * @returns {Promise} 服务状态
   */
  async checkHealth() {
    try {
      const response = await this.request(`${this.baseUrl}/health`);
      return response;
    } catch (error) {
      console.error('Health check API error:', error);
      throw error;
    }
  }

  /**
   * 播放Base64音频数据
   * @param {string} audioBase64 - Base64编码的音频数据
   * @param {string} format - 音频格式，默认mp3
   */
  playAudioFromBase64(audioBase64, format = 'mp3') {
    if (!audioBase64) {
      console.error('音频数据为空');
      return;
    }

    try {
      const audioContext = wx.createInnerAudioContext();
      audioContext.src = `data:audio/${format};base64,${audioBase64}`;
      
      audioContext.onError((error) => {
        console.error('音频播放失败:', error);
        wx.showToast({
          title: '音频播放失败',
          icon: 'error'
        });
      });

      audioContext.play();
      
      // 播放完成后销毁音频上下文
      audioContext.onEnded(() => {
        audioContext.destroy();
      });

      return audioContext;
    } catch (error) {
      console.error('创建音频上下文失败:', error);
      wx.showToast({
        title: '音频播放失败',
        icon: 'error'
      });
    }
  }

  /**
   * 重试机制的API调用
   * @param {Function} apiCall - API调用函数
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 初始延迟时间（毫秒）
   */
  async callWithRetry(apiCall, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.log(`API调用失败，${delay}ms后重试... (第${attempt}/${maxRetries}次尝试)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }
  }
}

// 导出单例实例
const phonicsAPI = new PhonicsAPIClient();

module.exports = {
  phonicsAPI,
  PhonicsAPIClient
};