import { SpeechRecognitionService } from '../../utils/pronunciation';
import { Word, wordList } from '../../utils/wordData';
import { phonicsAPI } from '../../utils/phonicsAPI';

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

interface StepTab {
  key: string;
  label: string;
  disabled?: boolean;
}

interface PhonicsItem {
  letters: string;
  sound: string;
}

interface ReadingAnalysis {
  phonics?: PhonicsItem[];
  syllables?: string[];
  ipa?: string[];
  stressedSyllables?: SyllableStressedItem[][];
  syllableBlocks?: SyllableBlock[];
  tips: string;
  count?: number;
}

Page({
  data: {
    // 基础数据
    wordList: [] as Word[],
    selectedWordIndex: 0,
    currentWord: {} as Word,
    
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
    ] as StepTab[],
    activeTab: 'learn',
    
    // 拼读功能
    readingMode: 'phonics' as 'phonics' | 'syllable',
    readingAnalysis: null as ReadingAnalysis | null,
    phonemeList: [] as string[],
    wordParts: [] as string[],
    
    // 词根助记
    mnemonicMeanings: {} as Record<string, string>,
    mnemonicExplanation: '',
    
    // 录音功能
    isRecording: false,
    recognitionResult: '',
    accuracyScore: 0,
    feedback: '',
    
    // 音节录音功能
    recordingSyllableIndex: -1,
    syllableRecognitionResults: {} as Record<number, any>,
    
    // 示例口语
    usageExample: ''
  },

  recorderManager: null as any,
  tempFilePath: '',

  async onLoad(options: any) {
    await this.initWordList();
    this.initRecorderManager();
    
    // 如果传入了特定单词，直接选中
    if (options && options.word) {
      try {
        const word = JSON.parse(decodeURIComponent(options.word));
        const index = this.data.wordList.findIndex(item => item.id === word.id);
        if (index >= 0) {
          await this.selectWord(index);
        }
      } catch (error) {
        console.error('解析单词参数失败:', error);
      }
    }
  },

  async initWordList() {
    this.setData({
      wordList
    });
    
    // 默认选中第一个单词
    if (wordList.length > 0) {
      await this.selectWord(0);
    }
  },

  // 单词chip选择
  async selectWordChip(e: any) {
    const index = e.currentTarget.dataset.index;
    await this.selectWord(index);
  },
  
  async selectWord(index: number) {
    const word = this.data.wordList[index];
    if (!word) return;
    
    wx.showLoading({ title: '加载数据...' });
    
    try {
      // 生成音素列表
      const phonemeList = await this.generatePhonemeList(word.word);
      
      // 生成单词拆分（如果是复合词）
      const wordParts = await this.generateWordParts(word.word);
      
      // 生成示例口语
      const usageExample = this.generateUsageExample(word);
      
      // 生成拼读分析
      const readingAnalysis = await this.generateReadingAnalysis(word, this.data.readingMode);
      
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
    } catch (error) {
      console.error('加载单词数据失败:', error);
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // picker选择处理（兼容旧版本）
  async onWordSelect(e: any) {
    const index = e.detail.value;
    await this.selectWord(index);
  },

  initRecorderManager() {
    this.recorderManager = wx.getRecorderManager();

    this.recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
      });
    });

    this.recorderManager.onStop((res: any) => {
      console.log('录音结束', res);
      this.setData({
        isRecording: false,
      });

      this.tempFilePath = res.tempFilePath;
      this.processAudio(res.tempFilePath);
    });

    this.recorderManager.onError((res: any) => {
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

  toggleRecording() {
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

  async processAudio(tempFilePath: string) {
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
  switchTab(e: any) {
    const key = e.currentTarget.dataset.key;
    const tab = this.data.stepTabs.find(item => item.key === key);
    if (tab && !tab.disabled) {
      this.setData({
        activeTab: key
      });
    }
  },
  
  // 拼读模式切换
  async switchReadingMode(e: any) {
    const mode = e.currentTarget.dataset.mode as 'phonics' | 'syllable';
    
    // 显示加载状态
    wx.showLoading({ title: '切换模式中...' });
    
    try {
      const readingAnalysis = await this.generateReadingAnalysis(this.data.currentWord, mode);
      
      this.setData({
        readingMode: mode,
        readingAnalysis
      });
    } catch (error) {
      console.error('切换拼读模式时发生错误:', error);
      wx.showToast({
        title: '切换失败，请重试',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 播放单词发音（使用API音频）
  async playWordAudio() {
    const word = this.data.currentWord.word;
    if (!word) {
      wx.showToast({
        title: '请先选择单词',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '加载音频...' });
    
    try {
      const audioData = await phonicsAPI.getAudio(word);
      
      if (audioData) {
        phonicsAPI.playAudio(audioData);
      } else {
        throw new Error('音频数据为空');
      }
    } catch (error) {
      console.error('播放单词音频失败:', error);
      
      // 回退到提示信息
      wx.showToast({
        title: '播放发音: ' + word,
        icon: 'none',
        duration: 1000
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 播放单词部分音频（使用API音频）
  async playWordPartAudio(e: any) {
    const part = e.currentTarget.dataset.part;
    if (!part) {
      wx.showToast({
        title: '无效的单词部分',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '加载音频...' });
    
    try {
      const audioData = await phonicsAPI.getAudio(part);
      
      if (audioData) {
        phonicsAPI.playAudio(audioData);
      } else {
        throw new Error('音频数据为空');
      }
    } catch (error) {
      console.error('播放单词部分音频失败:', error);
      
      // 回退到提示信息
      wx.showToast({
        title: '播放发音: ' + part,
        icon: 'none',
        duration: 1000
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 显示详情
  showDetail() {
    wx.showToast({
      title: '打开词汇详情',
      icon: 'none'
    });
  },
  
  goBack() {
    wx.navigateBack();
  },

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
  async recordSyllable(e: any) {
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
  
  async startSyllableRecording(syllable: string, index: number) {
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
  
  doStartSyllableRecording(syllable: string, index: number) {
    try {
      const options = {
        duration: 5000, // 音节录音时间较短，5秒
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: 'mp3' as const,
      };

      // 确保录音管理器已初始化
      if (!this.recorderManager) {
        this.initRecorderManager();
      }

      // 设置录音停止回调
      this.recorderManager.onStop = (res: any) => {
        this.processSyllableAudio(res.tempFilePath, syllable, index);
      };

      // 开始录音
      this.recorderManager.start(options);
      
      // 自动停止录音
      setTimeout(() => {
        if (this.data.recordingSyllableIndex === index) {
          this.stopSyllableRecording();
        }
      }, 3000);
    } catch (error) {
      console.error('开始音节录音失败:', error);
      wx.showToast({
        title: '录音启动失败',
        icon: 'error'
      });
      this.setData({ recordingSyllableIndex: -1 });
    }
  },
  
  stopSyllableRecording() {
    this.recorderManager.stop();
    this.setData({
      recordingSyllableIndex: -1
    });
  },
  
  async processSyllableAudio(tempFilePath: string, targetSyllable: string, index: number) {
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
  
  async generatePhonemeList(word: string): Promise<string[]> {
    try {
      const response = await phonicsAPI.getPhonemes(word);
      
      if (response.data.phonemes && response.data.phonemes.length > 0) {
        return response.data.phonemes.map((phoneme: any) => `/${phoneme.arpaPhoneme}/`);
      }
      
      throw new Error('API返回的音素数据为空');
    } catch (error) {
      console.error('获取音素数据失败:', error);
      throw error;
    }
  },
  
  async generateWordParts(word: string): Promise<string[]> {
    try {
      const response = await phonicsAPI.getSplit(word);
      
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      
      throw new Error('API返回的数据为空');
    } catch (error) {
      console.error('获取单词拆分失败:', error);
      throw error;
    }
  },
  
  generateUsageExample(word: Word): string {
    const examples: { [key: string]: string } = {
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
  
  async generateReadingAnalysis(word: Word, mode: 'phonics' | 'syllable'): Promise<ReadingAnalysis | null> {
    if (!word || !word.word) return null;
    
    if (mode === 'phonics') {
      return await this.generatePhonicsAnalysis(word);
    } else {
      return await this.generateSyllableAnalysis(word);
    }
  },
  
  async generatePhonicsAnalysis(word: Word): Promise<ReadingAnalysis> {
    try {
      const response = await phonicsAPI.getPhonemes(word.word);
      
      if (response.data.phonemes && response.data.phonemes.length > 0) {
        const phonics = response.data.phonemes.map((phoneme: any) => ({
          letters: phoneme.letters,
          sound: `/${phoneme.arpaPhoneme}/`,
          type: 'phoneme',
          description: `${phoneme.letters} -> ${phoneme.ipaPhoneme}`
        }));
        
        return {
          phonics,
          syllableBlocks: response.data.syllableBlocks || [],
          tips: '自然拼读法：字母组合如何发音，帮助您掌握拼读规则和发音模式。'
        };
      }
      
      throw new Error('API响应中没有音素数据');
    } catch (error) {
      console.error('获取音素拆分失败:', error);
      throw error;
    }
  },
  
  async generateSyllableAnalysis(word: Word): Promise<ReadingAnalysis> {
    try {
      const response = await phonicsAPI.getSyllables(word.word);
      
      return {
        syllables: response.data.syllables || [word.word],
        ipa: response.data.ipa || [],
        stressedSyllables: response.data.stressedSyllables || [],
        tips: '音节拆分：将单词分解为发音单位，掌握节拍韵律和重音位置。',
        count: response.data.syllables?.length || 1
      };
    } catch (error) {
      console.error('获取音节拆分失败:', error);
      throw error;
    }
  },
  
  // 生成词根助记数据
  generateMnemonicData(word: Word, wordParts: string[]): { mnemonicMeanings: Record<string, string>, mnemonicExplanation: string } {
    // 确保 wordParts 是数组
    if (!Array.isArray(wordParts) || wordParts.length === 0) {
      return {
        mnemonicMeanings: {},
        mnemonicExplanation: ''
      };
    }
    
    // 词根含义映射
    const rootMeanings: Record<string, string> = {
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
    const explanations: Record<string, string> = {
      'schoolbag': '去学校要背的包，即书包',
      'basketball': '在篮子里投球的运动',
      'classroom': '班级上课的房间',
      'homework': '在家里要做的工作',
      'playground': '可以玩耶的地面场所',
      'waterbottle': '装水的瓶子',
      'sunlight': '太阳发出的光',
      'fireplace': '生火取暖的地方',
      'birthday': '出生的那一天'
    };
    
    const mnemonicMeanings: Record<string, string> = {};
    wordParts.forEach(part => {
      mnemonicMeanings[part] = rootMeanings[part.toLowerCase()] || '';
    });
    
    return {
      mnemonicMeanings,
      mnemonicExplanation: explanations[word.word.toLowerCase()] || `${word.word} 是由 ${wordParts.join(' + ')} 组成的复合词`
    };
  },
});
