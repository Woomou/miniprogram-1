/**
 * 语音识别服务
 * 模拟语音识别功能
 */

class SpeechRecognitionService {
  /**
   * 识别语音
   * @param {string} audioPath - 音频文件路径
   * @param {string} targetWord - 目标单词
   * @returns {Promise} 识别结果
   */
  static async recognizeSpeech(audioPath, targetWord) {
    // 模拟异步操作
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟识别结果
        const mockAccuracy = Math.floor(Math.random() * 40) + 60; // 60-100之间的随机数
        const result = {
          text: targetWord,
          accuracy: mockAccuracy,
          feedback: mockAccuracy >= 80 ? '发音很好！' : mockAccuracy >= 60 ? '发音还不错，可以再练习一下' : '需要多练习发音'
        };
        resolve(result);
      }, 1000);
    });
  }

  /**
   * 分析发音
   * @param {string} audioPath - 音频文件路径
   * @param {string} word - 单词
   * @returns {Promise} 分析结果
   */
  static async analyzePronunciation(audioPath, word) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          word: word,
          phonemes: this.generatePhonemes(word),
          syllables: this.generateSyllables(word),
          stress: this.generateStress(word),
          score: Math.floor(Math.random() * 40) + 60
        };
        resolve(result);
      }, 1500);
    });
  }

  /**
   * 生成音素拆分
   * @param {string} word - 单词
   * @returns {Array} 音素列表
   */
  static generatePhonemes(word) {
    // 简单的音素映射
    const phonemeMap = {
      'apple': ['/æ/', '/p/', '/əl/'],
      'hello': ['/h/', '/ə/', '/l/', '/əʊ/'],
      'book': ['/b/', '/ʊ/', '/k/'],
      'cat': ['/k/', '/æ/', '/t/'],
      'dog': ['/d/', '/ɒ/', '/g/']
    };

    return phonemeMap[word.toLowerCase()] || [];
  }

  /**
   * 生成音节拆分
   * @param {string} word - 单词
   * @returns {Array} 音节列表
   */
  static generateSyllables(word) {
    const syllableMap = {
      'apple': ['ap', 'ple'],
      'hello': ['hel', 'lo'],
      'book': ['book'],
      'beautiful': ['beau', 'ti', 'ful'],
      'computer': ['com', 'pu', 'ter']
    };

    return syllableMap[word.toLowerCase()] || [word];
  }

  /**
   * 生成重音信息
   * @param {string} word - 单词
   * @returns {Object} 重音信息
   */
  static generateStress(word) {
    return {
      primary: 0, // 主重音位置
      secondary: -1 // 次重音位置
    };
  }
}

// 语音识别工具函数
const PronunciationUtils = {
  /**
   * 检查是否为元音
   * @param {string} char - 字符
   * @returns {boolean} 是否为元音
   */
  isVowel(char) {
    return 'aeiouAEIOU'.indexOf(char) !== -1;
  },

  /**
   * 简单的音节计数
   * @param {string} word - 单词
   * @returns {number} 音节数量
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    let count = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isVowel = this.isVowel(char);
      
      if (isVowel && !prevWasVowel) {
        count++;
      }
      
      prevWasVowel = isVowel;
    }
    
    // 处理以e结尾的单词
    if (word.endsWith('e')) {
      count--;
    }
    
    return Math.max(count, 1);
  },

  /**
   * 基础音标转换
   * @param {string} word - 单词
   * @returns {string} 音标
   */
  getPhonetic(word) {
    const phoneticMap = {
      'apple': 'ˈæpəl',
      'hello': 'həˈləʊ',
      'book': 'bʊk',
      'cat': 'kæt',
      'dog': 'dɒg'
    };

    return phoneticMap[word.toLowerCase()] || '';
  }
};

// 导出服务和工具
module.exports = {
  SpeechRecognitionService,
  PronunciationUtils
};