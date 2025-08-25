/**
 * 自然拼读和音节拆分 API 客户端
 * 基于 https://ai.fenzhidao.com/pronunciation 服务
 */

const API_BASE_URL = 'https://ai.fenzhidao.com/pronunciation';

interface SplitWordOptions {
  splitTypes?: string[];
  generateAudio?: boolean;
  audioType?: string;
}

interface APIResponse {
  [key: string]: any;
}

class PhonicsAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * 发送网络请求的通用方法
   * @param url - 请求URL
   * @param options - 请求选项
   * @returns API响应数据
   */
  private async request(url: string, options: any = {}): Promise<APIResponse> {
    const defaultOptions = {
      timeout: 10000, // 10秒超时
      header: {
        'Content-Type': 'application/json'
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options
    };

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header: requestOptions.header,
        timeout: requestOptions.timeout,
        success: (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`API请求失败: ${res.statusCode} - ${res.data?.error || '未知错误'}`));
          }
        },
        fail: (err: any) => {
          console.error('Network request failed:', err);
          reject(new Error(`网络请求失败: ${err.errMsg || '网络连接异常'}`));
        }
      });
    });
  }

  /**
   * 单词拆分 - 主要的拆分服务
   * @param word - 要拆分的英语单词
   * @param options - 拆分选项
   * @returns 拆分结果
   */
  async splitWord(word: string, options: SplitWordOptions = {}): Promise<APIResponse> {
    const {
      splitTypes = ['syllable', 'phoneme_basic'],
      generateAudio = false,
      audioType = 'combined'
    } = options;

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
   * @param word - 要拆分的英语单词
   * @returns 音节拆分结果
   */
  async getSyllables(word: string): Promise<APIResponse> {
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
   * @param word - 要拆分的英语单词
   * @returns 音素拆分结果
   */
  async getPhonemes(word: string): Promise<APIResponse> {
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
   * @param word - 要生成音频的英语单词
   * @returns 音频数据
   */
  async getAudio(word: string): Promise<APIResponse> {
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
   * @param word - 要分析的英语单词
   * @param includeAudio - 是否包含音频
   * @returns 完整分析结果
   */
  async analyzeWord(word: string, includeAudio: boolean = false): Promise<APIResponse> {
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
   * @returns 服务状态
   */
  async checkHealth(): Promise<APIResponse> {
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
   * @param audioBase64 - Base64编码的音频数据
   * @param format - 音频格式，默认mp3
   */
  playAudioFromBase64(audioBase64: string, format: string = 'mp3'): any {
    if (!audioBase64) {
      console.error('音频数据为空');
      return;
    }

    try {
      const audioContext = wx.createInnerAudioContext();
      audioContext.src = `data:audio/${format};base64,${audioBase64}`;
      
      audioContext.onError((error: any) => {
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
   * @param apiCall - API调用函数
   * @param maxRetries - 最大重试次数
   * @param delay - 初始延迟时间（毫秒）
   */
  async callWithRetry(apiCall: () => Promise<any>, maxRetries: number = 3, delay: number = 1000): Promise<any> {
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
export const phonicsAPI = new PhonicsAPIClient();
export { PhonicsAPIClient };
