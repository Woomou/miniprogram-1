import { SpeechRecognitionService } from '../../utils/pronunciation';
import { Word } from '../../utils/wordData';

Page({
  data: {
    currentWord: {} as Word,
    isRecording: false,
    recognitionResult: '',
    accuracyScore: 0,
    feedback: '',
  },

  recorderManager: null as any,
  tempFilePath: '',

  onLoad(options: any) {
    if (options.word) {
      const word = JSON.parse(decodeURIComponent(options.word));
      this.setData({
        currentWord: word,
      });
    }

    // 初始化录音管理器
    this.initRecorderManager();
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

  goBack() {
    wx.navigateBack();
  },

  retryTest() {
    this.setData({
      recognitionResult: '',
      accuracyScore: 0,
      feedback: '',
    });
  },
});
