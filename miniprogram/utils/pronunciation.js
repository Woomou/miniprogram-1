/**
 * 发音准确度计算工具类
 */
export class PronunciationAnalyzer {
  /**
   * 计算两个字符串的相似度
   * @param original 原始单词
   * @param recognized 识别结果
   * @returns 相似度百分比
   */
  static calculateSimilarity(original, recognized) {
    const originalLower = original.toLowerCase().trim();
    const recognizedLower = recognized.toLowerCase().trim();

    if (originalLower === recognizedLower) {
      return 100;
    }

    // 使用编辑距离算法
    const distance = this.levenshteinDistance(originalLower, recognizedLower);
    const maxLength = Math.max(originalLower.length, recognizedLower.length);
    const similarity = (maxLength - distance) / maxLength;

    return Math.round(similarity * 100);
  }

  /**
   * 编辑距离算法
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 编辑距离
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替换
            matrix[i][j - 1] + 1, // 插入
            matrix[i - 1][j] + 1 // 删除
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 分析发音错误并生成反馈
   * @param original 原始单词
   * @param recognized 识别结果
   * @returns 反馈信息
   */
  static generateFeedback(original, recognized) {
    const originalLower = original.toLowerCase();
    const recognizedLower = recognized.toLowerCase();

    if (originalLower === recognizedLower) {
      return '发音非常准确！继续保持！';
    }

    const errors = this.analyzeErrors(originalLower, recognizedLower);
    return this.formatFeedback(errors);
  }

  /**
   * 分析发音错误
   * @param original 原始单词
   * @param recognized 识别结果
   * @returns 错误分析结果
   */
  static analyzeErrors(original, recognized) {
    const errors = [];

    // 检查单词长度差异
    if (recognized.length > original.length) {
      errors.push({
        type: 'extra',
        message: '发音中包含了多余的音素',
      });
    } else if (recognized.length < original.length) {
      errors.push({
        type: 'missing',
        message: '单词发音不完整，缺少某些音素',
      });
    }

    // 检查元音错误
    const vowelErrors = this.checkVowelErrors(original, recognized);
    if (vowelErrors.length > 0) {
      errors.push(...vowelErrors);
    }

    // 检查辅音错误
    const consonantErrors = this.checkConsonantErrors(original, recognized);
    if (consonantErrors.length > 0) {
      errors.push(...consonantErrors);
    }

    return errors;
  }

  /**
   * 检查元音错误
   * @param original 原始单词
   * @param recognized 识别结果
   * @returns 元音错误列表
   */
  static checkVowelErrors(original, recognized) {
    const vowels = 'aeiou';
    const errors = [];

    for (let i = 0; i < Math.min(original.length, recognized.length); i++) {
      const origChar = original[i];
      const recogChar = recognized[i];

      if (
        vowels.includes(origChar) &&
        vowels.includes(recogChar) &&
        origChar !== recogChar
      ) {
        errors.push({
          type: 'vowel',
          position: i,
          original: origChar,
          recognized: recogChar,
          message: `第${i + 1}个元音发音不准确，应该是"${origChar}"而不是"${recogChar}"`,
        });
      }
    }

    return errors;
  }

  /**
   * 检查辅音错误
   * @param original 原始单词
   * @param recognized 识别结果
   * @returns 辅音错误列表
   */
  static checkConsonantErrors(original, recognized) {
    const vowels = 'aeiou';
    const errors = [];

    for (let i = 0; i < Math.min(original.length, recognized.length); i++) {
      const origChar = original[i];
      const recogChar = recognized[i];

      if (
        !vowels.includes(origChar) &&
        !vowels.includes(recogChar) &&
        origChar !== recogChar
      ) {
        errors.push({
          type: 'consonant',
          position: i,
          original: origChar,
          recognized: recogChar,
          message: `第${i + 1}个辅音发音不准确，应该是"${origChar}"而不是"${recogChar}"`,
        });
      }
    }

    return errors;
  }

  /**
   * 格式化反馈信息
   * @param errors 错误列表
   * @returns 格式化的反馈
   */
  static formatFeedback(errors) {
    if (errors.length === 0) {
      return '发音基本正确，可以继续练习！';
    }

    const feedbacks = errors.map((error) => error.message);
    return feedbacks.join('；') + '。建议重新练习这个单词的发音。';
  }

  /**
   * 获取发音建议
   * @param word 单词
   * @param phonetic 音标
   * @returns 发音建议
   */
  static getPronunciationTips(word, phonetic) {
    const tips = [];

    // 根据单词长度给出建议
    if (word.length > 8) {
      tips.push('长单词建议分段练习，先练习前半部分，再练习后半部分');
    }

    // 根据音标特征给出建议
    if (phonetic.includes('θ') || phonetic.includes('ð')) {
      tips.push('注意咬舌音的发音，舌尖要放在上下牙齿之间');
    }

    if (phonetic.includes('ʃ') || phonetic.includes('ʒ')) {
      tips.push('注意摩擦音的发音，舌头要卷起');
    }

    if (phonetic.includes('ŋ')) {
      tips.push('注意鼻音的发音，气流要从鼻腔通过');
    }

    return tips.length > 0
      ? tips.join('；') + '。'
      : '请仔细听标准发音并模仿。';
  }
}

/**
 * 语音识别服务类
 */
export class SpeechRecognitionService {
  /**
   * 模拟语音识别（实际项目中需要调用真实的语音识别API）
   * @param audioFilePath 音频文件路径
   * @param targetWord 目标单词
   * @returns 识别结果
   */
  static async recognizeSpeech(audioFilePath, targetWord) {
    // 这里应该调用真实的语音识别API
    // 例如：百度语音识别、腾讯云语音识别、阿里云语音识别等

    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟识别结果
        const mockResults = this.generateMockResults(targetWord);
        const randomResult =
          mockResults[Math.floor(Math.random() * mockResults.length)];

        resolve({
          text: randomResult.text,
          confidence: randomResult.confidence,
          accuracy: PronunciationAnalyzer.calculateSimilarity(
            targetWord,
            randomResult.text
          ),
          feedback: PronunciationAnalyzer.generateFeedback(
            targetWord,
            randomResult.text
          ),
        });
      }, 2000);
    });
  }

  /**
   * 生成模拟识别结果
   * @param targetWord 目标单词
   * @returns 模拟结果列表
   */
  static generateMockResults(targetWord) {
    const word = targetWord.toLowerCase();

    return [
      { text: word, confidence: 0.95 },
      { text: word.replace(/[aeiou]/g, 'a'), confidence: 0.75 },
      { text: word + 's', confidence: 0.8 },
      { text: word.substring(0, word.length - 1), confidence: 0.7 },
      { text: 'similar', confidence: 0.6 },
      { text: word.replace(/[bcdfghjklmnpqrstvwxyz]/g, 'b'), confidence: 0.65 },
    ];
  }
}
