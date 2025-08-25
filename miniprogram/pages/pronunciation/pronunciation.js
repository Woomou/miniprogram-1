// 导入单词数据
const { wordList } = require('../../utils/wordData');

const { SpeechRecognitionService } = require('../../utils/pronunciation');

Page({
  data: {
    // 基础数据
    wordList: [],
    selectedWordIndex: 0,
    currentWord: {},
    
    // 学习步骤tabs
    stepTabs: [
      { key: 'learn', label: '学' },
      { key: 'read', label: '读' },
      { key: 'choose', label: '选' },
      { key: 'split1', label: '拆', disabled: true },
      { key: 'hyphen1', label: '一', disabled: true },
      { key: 'spell', label: '拼' },
      { key: 'hyphen2', label: '一', disabled: true },
      { key: 'write', label: '写' }
    ],
    activeTab: 'learn',
    
    // 拼读功能
    readingMode: 'phonics', // 'phonics' or 'syllable'
    readingAnalysis: null,
    phonemeList: [],
    wordParts: [],
    
    // 词根助记
    mnemonicMeanings: {},
    mnemonicExplanation: '',
    
    // 录音功能
    isRecording: false,
    recognitionResult: '',
    accuracyScore: 0,
    feedback: '',
    
    // 音节录音功能
    recordingSyllableIndex: -1,
    syllableRecognitionResults: {},
    
    // 示例口语
    usageExample: ''
  },

  recorderManager: null,

  onLoad(options) {
    this.initWordList();
    this.initRecorderManager();
    
    // 如果传入了特定单词，直接选中
    if (options && options.word) {
      try {
        const word = JSON.parse(decodeURIComponent(options.word));
        const index = this.data.wordList.findIndex(item => item.id === word.id);
        if (index >= 0) {
          this.selectWord(index);
        }
      } catch (error) {
        console.error('解析单词参数失败:', error);
      }
    }
  },

  initWordList() {
    this.setData({
      wordList
    });
    
    // 默认选中第一个单词
    if (wordList.length > 0) {
      this.selectWord(0);
    }
  },

  initRecorderManager() {
    this.recorderManager = wx.getRecorderManager();

    this.recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
      });
    });

    this.recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.setData({
        isRecording: false,
      });

      this.processAudio(res.tempFilePath);
    });

    this.recorderManager.onError((res) => {
      console.error('录音错误', res);
      wx.showToast({
        title: '录音失败',
        icon: 'error',
      });
      this.setData({
        isRecording: false,
      });
    });
  },

  // 单词chip选择
  selectWordChip(e) {
    const index = e.currentTarget.dataset.index;
    this.selectWord(index);
  },
  
  // 统一的单词选择方法
  selectWord(index) {
    const word = this.data.wordList[index];
    if (!word) return;
    
    // 生成音素列表
    const phonemeList = this.generatePhonemeList(word.phonetic);
    
    // 生成单词拆分（如果是复合词）
    const wordParts = this.generateWordParts(word.word);
    
    // 生成示例口语
    const usageExample = this.generateUsageExample(word);
    
    // 生成拼读分析
    const readingAnalysis = this.generateReadingAnalysis(word, this.data.readingMode);
    
    // 生成词根助记
    const { mnemonicMeanings, mnemonicExplanation } = this.generateMnemonicData(word, wordParts);
    
    this.setData({
      selectedWordIndex: index,
      currentWord: word,
      phonemeList,
      wordParts,
      usageExample,
      readingAnalysis,
      mnemonicMeanings,
      mnemonicExplanation,
      // 清除之前的录音结果
      recognitionResult: '',
      accuracyScore: 0,
      feedback: '',
      recordingSyllableIndex: -1,
      syllableRecognitionResults: {}
    });
  },
  
  // picker选择处理（兼容旧版本）
  onWordSelect(e) {
    const index = e.detail.value;
    this.selectWord(index);
  },

  toggleRecording() {
    if (!this.data.currentWord.word) {
      wx.showToast({
        title: '请先选择单词',
        icon: 'none',
      });
      return;
    }

    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  startRecording() {
    // 检查录音权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.doStartRecording();
            },
            fail: () => {
              wx.showModal({
                title: '需要录音权限',
                content: '请在设置中开启录音权限',
                showCancel: false,
              });
            },
          });
        } else {
          this.doStartRecording();
        }
      },
    });
  },

  doStartRecording() {
    const options = {
      duration: 10000, // 最长录音时间10秒
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 96000, // 编码码率
      format: 'mp3', // 音频格式
    };

    this.recorderManager.start(options);
  },

  stopRecording() {
    this.recorderManager.stop();
  },

  async processAudio(tempFilePath) {
    wx.showLoading({
      title: '正在识别...',
    });

    try {
      // 使用语音识别服务
      const result = await SpeechRecognitionService.recognizeSpeech(
        tempFilePath,
        this.data.currentWord.word
      );

      this.setData({
        recognitionResult: result.text,
        accuracyScore: result.accuracy,
        feedback: result.feedback,
      });

      // 显示结果
      wx.showToast({
        title: `准确度: ${result.accuracy}%`,
        icon: 'none',
        duration: 2000,
      });
    } catch (error) {
      console.error('语音识别失败:', error);
      wx.showToast({
        title: '识别失败，请重试',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 学习步骤Tab切换
  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    const tab = this.data.stepTabs.find(item => item.key === key);
    if (tab && !tab.disabled) {
      this.setData({
        activeTab: key
      });
    }
  },
  
  // 拼读模式切换
  switchReadingMode(e) {
    const mode = e.currentTarget.dataset.mode;
    const readingAnalysis = this.generateReadingAnalysis(this.data.currentWord, mode);
    
    this.setData({
      readingMode: mode,
      readingAnalysis
    });
  },
  
  // 播放单词发音
  playWordAudio() {
    // 这里可以集成真实的音频播放功能
    wx.showToast({
      title: '播放发音: ' + this.data.currentWord.word,
      icon: 'none',
      duration: 1000
    });
  },
  
  // 显示详情
  showDetail() {
    wx.showToast({
      title: '打开词汇详情',
      icon: 'none'
    });
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 重新测试
  retryTest() {
    this.setData({
      recognitionResult: '',
      accuracyScore: 0,
      feedback: '',
      recordingSyllableIndex: -1,
      syllableRecognitionResults: {}
    });
  },
  
  // 音节录音功能
  async recordSyllable(e) {
    const syllable = e.currentTarget.dataset.syllable;
    const index = parseInt(e.currentTarget.dataset.index);
    
    if (this.data.recordingSyllableIndex === index) {
      // 停止当前录音
      this.stopSyllableRecording();
    } else {
      // 开始新的音节录音
      this.startSyllableRecording(syllable, index);
    }
  },
  
  async startSyllableRecording(syllable, index) {
    this.setData({
      recordingSyllableIndex: index
    });
    
    // 检查录音权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.doStartSyllableRecording(syllable, index);
            },
            fail: () => {
              wx.showModal({
                title: '需要录音权限',
                content: '请在设置中开启录音权限',
                showCancel: false,
              });
              this.setData({ recordingSyllableIndex: -1 });
            },
          });
        } else {
          this.doStartSyllableRecording(syllable, index);
        }
      },
    });
  },
  
  doStartSyllableRecording(syllable, index) {
    const options = {
      duration: 5000, // 音节录音时间较短，5秒
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
    };

    this.recorderManager.onStop = (res) => {
      this.processSyllableAudio(res.tempFilePath, syllable, index);
    };

    this.recorderManager.start(options);
    
    // 自动停止录音
    setTimeout(() => {
      if (this.data.recordingSyllableIndex === index) {
        this.stopSyllableRecording();
      }
    }, 3000);
  },
  
  stopSyllableRecording() {
    this.recorderManager.stop();
    this.setData({
      recordingSyllableIndex: -1
    });
  },
  
  async processSyllableAudio(tempFilePath, targetSyllable, index) {
    wx.showLoading({
      title: '识别中...',
    });

    try {
      // 使用语音识别服务识别音节
      const result = await SpeechRecognitionService.recognizeSpeech(
        tempFilePath,
        targetSyllable
      );

      // 更新音节识别结果
      const syllableResults = { ...this.data.syllableRecognitionResults };
      syllableResults[index] = {
        target: targetSyllable,
        recognized: result.text,
        accuracy: result.accuracy
      };
      
      this.setData({
        syllableRecognitionResults: syllableResults
      });

      // 显示结果
      wx.showToast({
        title: `${targetSyllable}: ${result.accuracy}%`,
        icon: 'none',
        duration: 2000,
      });
    } catch (error) {
      console.error('音节识别失败:', error);
      wx.showToast({
        title: '识别失败，请重试',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 工具方法：生成音素列表
  generatePhonemeList(phonetic) {
    // 简单的音素拆分，实际中可以使用更复杂的算法
    if (!phonetic) return [];
    
    // 移除音标符号并拆分
    const cleanPhonetic = phonetic.replace(/[ˈˌː]/g, ' ').trim();
    return cleanPhonetic.split(/\s+/).filter(p => p.length > 0).map(p => '/' + p + '/');
  },
  
  // 工具方法：生成单词拆分
  generateWordParts(word) {
    // 检查是否为复合词
    const compoundWords = {
      'schoolbag': ['school', 'bag'],
      'basketball': ['basket', 'ball'],
      'classroom': ['class', 'room'],
      'homework': ['home', 'work']
    };
    
    return compoundWords[word.toLowerCase()] || [];
  },
  
  // 工具方法：生成示例口语
  generateUsageExample(word) {
    const examples = {
      'apple': 'I eat an <b>apple</b> every day.',
      'hello': '<b>Hello</b>, nice to meet you!',
      'book': 'Please read this <b>book</b> carefully.',
      'cat': 'The <b>cat</b> is sleeping on the sofa.',
      'dog': 'My <b>dog</b> loves to play in the park.',
      'beautiful': 'She has a <b>beautiful</b> smile.',
      'computer': 'I use my <b>computer</b> for work.',
      'technology': '<b>Technology</b> changes our lives.',
      'important': 'Education is very <b>important</b>.',
      'different': 'We have <b>different</b> opinions.',
      'pronunciation': 'Good <b>pronunciation</b> helps communication.',
      'international': 'This is an <b>international</b> company.',
      'communication': '<b>Communication</b> is the key to success.',
      'responsibility': 'We all have <b>responsibility</b> for our future.',
      'opportunity': 'This is a great <b>opportunity</b> to learn.'
    };
    
    return examples[word.word.toLowerCase()] || `This is an example with <b>${word.word}</b>.`;
  },
  
  // 工具方法：生成拼读分析
  generateReadingAnalysis(word, mode) {
    if (!word || !word.word) return null;
    
    if (mode === 'phonics') {
      return this.generatePhonicsAnalysis(word);
    } else {
      return this.generateSyllableAnalysis(word);
    }
  },
  
  // 生成自然拼读分析
  generatePhonicsAnalysis(word) {
    const phonicsMap = {
      'apple': [
        { letters: 'a', sound: '/æ/' },
        { letters: 'pp', sound: '/p/' },
        { letters: 'le', sound: '/əl/' }
      ],
      'hello': [
        { letters: 'h', sound: '/h/' },
        { letters: 'e', sound: '/ə/' },
        { letters: 'll', sound: '/l/' },
        { letters: 'o', sound: '/əʊ/' }
      ],
      'book': [
        { letters: 'b', sound: '/b/' },
        { letters: 'oo', sound: '/ʊ/' },
        { letters: 'k', sound: '/k/' }
      ]
    };
    
    const phonics = phonicsMap[word.word.toLowerCase()] || [
      { letters: word.word, sound: '/' + word.phonetic + '/' }
    ];
    
    return {
      phonics,
      tips: '自然拼读法将字母与发音对应，帮助您掌握发音规则。'
    };
  },
  
  // 生成音节拆分分析
  generateSyllableAnalysis(word) {
    const syllableMap = {
      'apple': ['ap', 'ple'],
      'hello': ['hel', 'lo'],
      'book': ['book'],
      'beautiful': ['beau', 'ti', 'ful'],
      'computer': ['com', 'pu', 'ter'],
      'pronunciation': ['pro', 'nun', 'ci', 'a', 'tion']
    };
    
    const syllables = syllableMap[word.word.toLowerCase()] || [word.word];
    
    return {
      syllables,
      tips: '音节拆分帮助您更好地掌握单词的节奏和重音。'
    };
  },
  
  // 生成词根助记数据
  generateMnemonicData(word, wordParts) {
    if (!wordParts || wordParts.length === 0) {
      return {
        mnemonicMeanings: {},
        mnemonicExplanation: ''
      };
    }
    
    // 词根含义映射
    const rootMeanings = {
      'school': '学校',
      'bag': '包',
      'basket': '篮子',
      'ball': '球',
      'class': '班级',
      'room': '房间',
      'home': '家',
      'work': '工作',
      'play': '玩',
      'ground': '地面',
      'water': '水',
      'bottle': '瓶子',
      'sun': '太阳',
      'light': '光',
      'fire': '火',
      'place': '地方',
      'birth': '出生',
      'day': '天'
    };
    
    // 构建助记解释
    const explanations = {
      'schoolbag': '去学校要背的包，即书包',
      'basketball': '在篮子里投球的运动',
      'classroom': '班级上课的房间',
      'homework': '在家里要做的工作',
      'playground': '可以玩耍的地面场所',
      'waterbottle': '装水的瓶子',
      'sunlight': '太阳发出的光',
      'fireplace': '生火取暖的地方',
      'birthday': '出生的那一天'
    };
    
    const mnemonicMeanings = {};
    wordParts.forEach(part => {
      mnemonicMeanings[part] = rootMeanings[part.toLowerCase()] || '';
    });
    
    return {
      mnemonicMeanings,
      mnemonicExplanation: explanations[word.word.toLowerCase()] || `${word.word} 是由 ${wordParts.join(' + ')} 组成的复合词`
    };
  },
});
