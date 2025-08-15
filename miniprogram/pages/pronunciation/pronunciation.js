// 临时直接定义单词列表，避免导入问题
const wordList = [
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
    word: 'pronunciation',
    phonetic: 'prəˌnʌnsiˈeɪʃən',
    meaning: '发音',
    difficulty: 'hard',
    category: '语言',
  },
];

import { SpeechRecognitionService } from '../../utils/pronunciation';
import {
  analyzePhonemes,
  analyzeDifficulty,
  generatePronunciationTips,
} from '../../utils/phonemeAnalyzer';

Page({
  data: {
    wordList: [],
    selectedWordIndex: 0,
    currentWord: {},
    phonemeInfo: [],
    difficultyInfo: null,
    pronunciationTips: [],
    isRecording: false,
    recognitionResult: '',
    accuracyScore: 0,
    feedback: '',
  },

  recorderManager: null,

  onLoad() {
    this.initWordList();
    this.initRecorderManager();
  },

  initWordList() {
    console.log('初始化单词列表:', wordList);
    this.setData({
      wordList,
    });
    console.log('设置后的单词列表:', this.data.wordList);
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

  // 单词选择处理
  onWordSelect(e) {
    const index = e.detail.value;
    const word = this.data.wordList[index];

    // 使用专业的音素分析工具
    const phonemeInfo = analyzePhonemes(word.word, word.phonetic);
    const difficultyInfo = analyzeDifficulty(phonemeInfo);
    const pronunciationTips = generatePronunciationTips(
      phonemeInfo,
      difficultyInfo.level
    );

    this.setData({
      selectedWordIndex: index,
      currentWord: word,
      phonemeInfo: phonemeInfo,
      difficultyInfo: difficultyInfo,
      pronunciationTips: pronunciationTips,
      recognitionResult: '',
      accuracyScore: 0,
      feedback: '',
    });
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

  retryTest() {
    this.setData({
      recognitionResult: '',
      accuracyScore: 0,
      feedback: '',
    });
  },
});
