export interface Word {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export const wordList: Word[] = [
  // 简单单词
  {
    id: 1,
    word: 'apple',
    phonetic: 'ˈæpəl',
    meaning: '苹果',
    difficulty: 'easy',
    category: '水果',
  },
  {
    id: 2,
    word: 'hello',
    phonetic: 'həˈləʊ',
    meaning: '你好',
    difficulty: 'easy',
    category: '问候',
  },
  {
    id: 3,
    word: 'book',
    phonetic: 'bʊk',
    meaning: '书',
    difficulty: 'easy',
    category: '物品',
  },
  {
    id: 4,
    word: 'cat',
    phonetic: 'kæt',
    meaning: '猫',
    difficulty: 'easy',
    category: '动物',
  },
  {
    id: 5,
    word: 'dog',
    phonetic: 'dɒɡ',
    meaning: '狗',
    difficulty: 'easy',
    category: '动物',
  },

  // 中等难度单词
  {
    id: 6,
    word: 'beautiful',
    phonetic: 'ˈbjuːtɪfʊl',
    meaning: '美丽的',
    difficulty: 'medium',
    category: '形容词',
  },
  {
    id: 7,
    word: 'computer',
    phonetic: 'kəmˈpjuːtər',
    meaning: '计算机',
    difficulty: 'medium',
    category: '科技',
  },
  {
    id: 8,
    word: 'technology',
    phonetic: 'tekˈnɒlədʒi',
    meaning: '技术',
    difficulty: 'medium',
    category: '科技',
  },
  {
    id: 9,
    word: 'important',
    phonetic: 'ɪmˈpɔːtənt',
    meaning: '重要的',
    difficulty: 'medium',
    category: '形容词',
  },
  {
    id: 10,
    word: 'different',
    phonetic: 'ˈdɪfərənt',
    meaning: '不同的',
    difficulty: 'medium',
    category: '形容词',
  },

  // 困难单词
  {
    id: 11,
    word: 'pronunciation',
    phonetic: 'prəˌnʌnsiˈeɪʃən',
    meaning: '发音',
    difficulty: 'hard',
    category: '语言',
  },
  {
    id: 12,
    word: 'international',
    phonetic: 'ˌɪntərˈnæʃənəl',
    meaning: '国际的',
    difficulty: 'hard',
    category: '形容词',
  },
  {
    id: 13,
    word: 'communication',
    phonetic: 'kəˌmjuːnɪˈkeɪʃən',
    meaning: '交流',
    difficulty: 'hard',
    category: '语言',
  },
  {
    id: 14,
    word: 'responsibility',
    phonetic: 'rɪˌspɒnsəˈbɪləti',
    meaning: '责任',
    difficulty: 'hard',
    category: '抽象概念',
  },
  {
    id: 15,
    word: 'opportunity',
    phonetic: 'ˌɒpəˈtjuːnəti',
    meaning: '机会',
    difficulty: 'hard',
    category: '抽象概念',
  },
];

/**
 * 根据难度获取单词列表
 * @param difficulty 难度等级
 * @returns 对应难度的单词列表
 */
export function getWordsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): Word[] {
  return wordList.filter((word) => word.difficulty === difficulty);
}

/**
 * 根据分类获取单词列表
 * @param category 分类
 * @returns 对应分类的单词列表
 */
export function getWordsByCategory(category: string): Word[] {
  return wordList.filter((word) => word.category === category);
}

/**
 * 获取所有分类
 * @returns 所有分类列表
 */
export function getAllCategories(): string[] {
  const categories = wordList.map((word) => word.category).filter(Boolean);
  return [...new Set(categories)] as string[];
}

/**
 * 随机获取单词
 * @param count 单词数量
 * @returns 随机单词列表
 */
export function getRandomWords(count: number): Word[] {
  const shuffled = [...wordList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
