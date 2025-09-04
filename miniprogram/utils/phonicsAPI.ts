/**
 * 自然拼读和音节拆分 API 客户端
 * 基于新的 selfstudy-app OpenAPI 规范
 */

const API_BASE_URL = 'https://ai.fenzhidao.com';
const AUTH_TOKEN = 'your-auth-token-here';

interface SyllableStressedItem {
  level: number | null;
  sub: string;
}

interface SyllableBlock {
  arpa: string;
  ipa: string;
  letters_range: number[];
  letters_span: string;
  stress: number;
  token_range: number[];
}

interface Phoneme {
  arpaPhoneme: string;
  ipaPhoneme: string;
  letters: string;
}

interface AllPhoneme {
  arpaPhoneme: string[];
  letterToArpaIndices: Record<string, string[]>;
  phonemes: Phoneme[];
  syllableBlocks: SyllableBlock[];
}

interface SyllableList {
  ipa: string[];
  syllables: string[];
  stressedSyllables: SyllableStressedItem[][];
}

interface AudioPhoneme {
  arpa: string;
  duration_ms: number;
  end_ms: number;
  espeak_units: string[];
  start_ms: number;
}

interface APIResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

class PhonicsAPIClient {
  private baseUrl: string;
  private authToken: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.authToken = AUTH_TOKEN;
  }

  /**
   * 发送网络请求的通用方法
   * @param url - 请求URL
   * @param options - 请求选项
   * @returns API响应数据
   */
  private async request<T = any>(url: string, options: any = {}): Promise<APIResponse<T>> {
    const defaultOptions = {
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        'X-Authorization-Token': this.authToken
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      header: {
        ...defaultOptions.header,
        ...options.header
      }
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
            reject(new Error(`API请求失败: ${res.statusCode} - ${res.data?.message || '未知错误'}`));
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
   * 获取单词拆分
   * @param word - 要拆分的英语单词
   * @returns 单词拆分结果
   */
  async getSplit(word: string): Promise<APIResponse<string[]>> {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const url = `${this.baseUrl}/pronunciation/api/v1/word/getSplit?word=${encodeURIComponent(word.toLowerCase().trim())}`;

    try {
      const response = await this.request<string[]>(url);
      return response;
    } catch (error) {
      console.error('Get split API error:', error);
      throw error;
    }
  }

  /**
   * 获取音节拆分
   * @param word - 要拆分的英语单词
   * @returns 音节拆分结果
   */
  async getSyllables(word: string): Promise<APIResponse<SyllableList>> {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const url = `${this.baseUrl}/pronunciation/api/v1/word/getSyllables?word=${encodeURIComponent(word.toLowerCase().trim())}`;

    try {
      const response = await this.request<SyllableList>(url);
      return response;
    } catch (error) {
      console.error('Get syllables API error:', error);
      throw error;
    }
  }

  /**
   * 获取音素拆分
   * @param word - 要拆分的英语单词
   * @returns 音素拆分结果
   */
  async getPhonemes(word: string): Promise<APIResponse<AllPhoneme>> {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const url = `${this.baseUrl}/pronunciation/api/v1/word/getPhonemes?word=${encodeURIComponent(word.toLowerCase().trim())}`;

    try {
      const response = await this.request<AllPhoneme>(url);
      return response;
    } catch (error) {
      console.error('Get phonemes API error:', error);
      throw error;
    }
  }

  /**
   * 获取读音音频
   * @param word - 要生成音频的英语单词
   * @param dialect - 方言 (UK或US)
   * @param male - 性别 (M或F)
   * @returns 音频数据（WAV格式）
   */
  async getAudio(word: string, dialect: string = 'US', male: string = 'M'): Promise<ArrayBuffer> {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const url = `${this.baseUrl}/pronunciation/api/v1/word/getAudio?word=${encodeURIComponent(word.toLowerCase().trim())}&dialect=${dialect}&male=${male}`;

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
        header: {
          'X-Authorization-Token': this.authToken
        },
        timeout: 10000,
        success: (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`));
          }
        },
        fail: (err: any) => {
          console.error('Get audio API error:', err);
          reject(new Error(`网络请求失败: ${err.errMsg || '网络连接异常'}`));
        }
      });
    });
  }

  /**
   * 获取音频和音节的对应
   * @param word - 要生成音频的单词
   * @param dialect - 方言 (UK或US)
   * @param male - 性别 (M或F)
   * @returns 音频时间段到音节对应关系
   */
  async getAudioPhoneme(word: string, dialect: string = 'US', male: string = 'M'): Promise<APIResponse<AudioPhoneme[]>> {
    if (!word || typeof word !== 'string') {
      throw new Error('单词参数不能为空');
    }

    const url = `${this.baseUrl}/pronunciation/api/v1/word/getAudioPhoneme?word=${encodeURIComponent(word.toLowerCase().trim())}&dialect=${dialect}&male=${male}`;

    try {
      const response = await this.request<AudioPhoneme[]>(url);
      return response;
    } catch (error) {
      console.error('Get audio phoneme API error:', error);
      throw error;
    }
  }

  /**
   * 检查服务可用性
   * @returns 服务状态
   */
  async checkHealth(): Promise<APIResponse<{ status: string }>> {
    try {
      const response = await this.request<{ status: string }>(`${this.baseUrl}/pronunciation/api/v1/health`);
      return response;
    } catch (error) {
      console.error('Health check API error:', error);
      throw error;
    }
  }

  /**
   * 播放音频数据
   * @param audioData - ArrayBuffer音频数据或Base64字符串
   * @param format - 音频格式，默认wav
   */
  playAudio(audioData: ArrayBuffer | string, format: string = 'wav'): any {
    if (!audioData) {
      console.error('音频数据为空');
      return;
    }

    try {
      const audioContext = wx.createInnerAudioContext();
      
      if (audioData instanceof ArrayBuffer) {
        const fs = wx.getFileSystemManager();
        const tempPath = `${wx.env.USER_DATA_PATH}/temp_audio.${format}`;
        
        fs.writeFileSync(tempPath, audioData);
        audioContext.src = tempPath;
      } else {
        audioContext.src = `data:audio/${format};base64,${audioData}`;
      }
      
      audioContext.onError((error: any) => {
        console.error('音频播放失败:', error);
        wx.showToast({
          title: '音频播放失败',
          icon: 'error'
        });
      });

      audioContext.play();
      
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
   * 设置认证令牌
   * @param token - 新的认证令牌
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * 重试机制的API调用
   * @param apiCall - API调用函数
   * @param maxRetries - 最大重试次数
   * @param delay - 初始延迟时间（毫秒）
   */
  async callWithRetry<T>(apiCall: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.log(`API调用失败，${delay}ms后重试... (第${attempt}/${maxRetries}次尝试)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error('重试次数超限');
  }
}

// 导出单例实例
export const phonicsAPI = new PhonicsAPIClient();
export { PhonicsAPIClient };
