/**
 * 英语音素分析工具
 * 用于分析英语单词的音素结构，识别元音和辅音
 */

// 英语音素模式定义
const PHONEME_PATTERNS = {
  // 元音音素
  vowels: {
    // 单元音
    single: ['a', 'e', 'i', 'o', 'u', 'y'],
    // 双元音
    diphthongs: [
      'ai',
      'ei',
      'oi',
      'au',
      'ou',
      'ea',
      'ee',
      'oo',
      'ie',
      'ue',
      'ay',
      'ey',
      'oy',
      'aw',
      'ew',
    ],
    // 三元音
    triphthongs: ['eir', 'air', 'our'],
  },

  // 辅音音素
  consonants: {
    // 单辅音
    single: [
      'b',
      'c',
      'd',
      'f',
      'g',
      'h',
      'j',
      'k',
      'l',
      'm',
      'n',
      'p',
      'q',
      'r',
      's',
      't',
      'v',
      'w',
      'x',
      'y',
      'z',
    ],
    // 双辅音组合
    digraphs: [
      'ch',
      'sh',
      'th',
      'ph',
      'wh',
      'gh',
      'ck',
      'ng',
      'qu',
      'sc',
      'sk',
      'sl',
      'sm',
      'sn',
      'sp',
      'st',
      'sw',
      'tr',
      'tw',
      'dr',
      'gr',
      'pr',
      'br',
      'cr',
      'fr',
      'tr',
      'bl',
      'cl',
      'fl',
      'gl',
      'pl',
      'sl',
    ],
    // 三辅音组合
    trigraphs: ['sch', 'scr', 'spr', 'str', 'spl', 'squ'],
  },
};

/**
 * 分析单词的音素结构
 * @param {string} word - 要分析的单词
 * @param {string} phonetic - 音标（可选）
 * @returns {Array} 音素分析结果
 */
function analyzePhonemes(word, _phonetic = '') {
  if (!word || typeof word !== 'string') {
    return [];
  }

  const wordLower = word.toLowerCase();
  const phonemes = [];
  let currentIndex = 0;

  while (currentIndex < wordLower.length) {
    let found = false;
    let phoneme = null;

    // 检查三字母音素
    if (currentIndex < wordLower.length - 2) {
      const threeChar = wordLower.substring(currentIndex, currentIndex + 3);

      // 检查三元音
      if (PHONEME_PATTERNS.vowels.triphthongs.includes(threeChar)) {
        phoneme = {
          phoneme: threeChar,
          type: '三元音',
          category: 'vowel',
          position: currentIndex,
          length: 3,
        };
        currentIndex += 3;
        found = true;
      }
      // 检查三辅音组合
      else if (PHONEME_PATTERNS.consonants.trigraphs.includes(threeChar)) {
        phoneme = {
          phoneme: threeChar,
          type: '三辅音',
          category: 'consonant',
          position: currentIndex,
          length: 3,
        };
        currentIndex += 3;
        found = true;
      }
    }

    // 检查双字母音素
    if (!found && currentIndex < wordLower.length - 1) {
      const twoChar = wordLower.substring(currentIndex, currentIndex + 2);

      // 检查双元音
      if (PHONEME_PATTERNS.vowels.diphthongs.includes(twoChar)) {
        phoneme = {
          phoneme: twoChar,
          type: '双元音',
          category: 'vowel',
          position: currentIndex,
          length: 2,
        };
        currentIndex += 2;
        found = true;
      }
      // 检查双辅音组合
      else if (PHONEME_PATTERNS.consonants.digraphs.includes(twoChar)) {
        phoneme = {
          phoneme: twoChar,
          type: '双辅音',
          category: 'consonant',
          position: currentIndex,
          length: 2,
        };
        currentIndex += 2;
        found = true;
      }
    }

    // 检查单字母音素
    if (!found && currentIndex < wordLower.length) {
      const oneChar = wordLower[currentIndex];

      // 检查单元音
      if (PHONEME_PATTERNS.vowels.single.includes(oneChar)) {
        phoneme = {
          phoneme: oneChar,
          type: '单元音',
          category: 'vowel',
          position: currentIndex,
          length: 1,
        };
      }
      // 检查单辅音
      else if (PHONEME_PATTERNS.consonants.single.includes(oneChar)) {
        phoneme = {
          phoneme: oneChar,
          type: '单辅音',
          category: 'consonant',
          position: currentIndex,
          length: 1,
        };
      }
      // 其他字符（如连字符、撇号等）
      else {
        phoneme = {
          phoneme: oneChar,
          type: '其他',
          category: 'other',
          position: currentIndex,
          length: 1,
        };
      }
      currentIndex++;
    }

    if (phoneme) {
      phonemes.push(phoneme);
    }
  }

  return phonemes;
}

/**
 * 获取音素统计信息
 * @param {Array} phonemes - 音素数组
 * @returns {Object} 统计信息
 */
function getPhonemeStats(phonemes) {
  const stats = {
    total: phonemes.length,
    vowels: 0,
    consonants: 0,
    others: 0,
    vowelTypes: {},
    consonantTypes: {},
  };

  phonemes.forEach((phoneme) => {
    if (phoneme.category === 'vowel') {
      stats.vowels++;
      stats.vowelTypes[phoneme.type] =
        (stats.vowelTypes[phoneme.type] || 0) + 1;
    } else if (phoneme.category === 'consonant') {
      stats.consonants++;
      stats.consonantTypes[phoneme.type] =
        (stats.consonantTypes[phoneme.type] || 0) + 1;
    } else {
      stats.others++;
    }
  });

  return stats;
}

/**
 * 分析单词的发音难度
 * @param {Array} phonemes - 音素数组
 * @returns {Object} 难度分析结果
 */
function analyzeDifficulty(phonemes) {
  const stats = getPhonemeStats(phonemes);

  let difficultyScore = 0;
  let difficultyLevel = 'easy';
  const reasons = [];

  // 根据音素数量评估难度
  if (stats.total > 8) {
    difficultyScore += 2;
    reasons.push('单词较长');
  }

  // 根据双元音和三元音数量评估难度
  if (stats.vowelTypes['双元音'] > 1 || stats.vowelTypes['三元音'] > 0) {
    difficultyScore += 2;
    reasons.push('包含复杂元音组合');
  }

  // 根据双辅音和三辅音数量评估难度
  if (
    stats.consonantTypes['双辅音'] > 2 ||
    stats.consonantTypes['三辅音'] > 0
  ) {
    difficultyScore += 2;
    reasons.push('包含复杂辅音组合');
  }

  // 确定难度等级
  if (difficultyScore >= 4) {
    difficultyLevel = 'hard';
  } else if (difficultyScore >= 2) {
    difficultyLevel = 'medium';
  } else {
    difficultyLevel = 'easy';
  }

  return {
    score: difficultyScore,
    level: difficultyLevel,
    reasons: reasons,
    stats: stats,
  };
}

/**
 * 生成发音建议
 * @param {Array} phonemes - 音素数组
 * @param {string} difficultyLevel - 难度等级
 * @returns {Array} 发音建议
 */
function generatePronunciationTips(phonemes, difficultyLevel) {
  const tips = [];

  // 基础建议
  tips.push('请清晰地发音每个音素');

  // 根据难度等级给出建议
  if (difficultyLevel === 'hard') {
    tips.push('这个单词较难，建议分音节练习');
    tips.push('注意元音和辅音的正确组合');
  } else if (difficultyLevel === 'medium') {
    tips.push('注意音素之间的过渡');
  }

  // 根据具体音素给出建议
  const hasDiphthongs = phonemes.some((p) => p.type === '双元音');
  const hasDigraphs = phonemes.some((p) => p.type === '双辅音');

  if (hasDiphthongs) {
    tips.push('双元音需要平滑过渡，不要分开读');
  }

  if (hasDigraphs) {
    tips.push('双辅音组合要作为一个整体发音');
  }

  return tips;
}

module.exports = {
  analyzePhonemes,
  getPhonemeStats,
  analyzeDifficulty,
  generatePronunciationTips,
  PHONEME_PATTERNS,
};
