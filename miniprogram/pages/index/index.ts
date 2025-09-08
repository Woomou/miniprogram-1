// index.ts
import { wordList, Word } from '../../utils/wordData';
import { recognizeHandwriting } from '../../utils/handwritingAPI';

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseNicknameComp: false,
    words: [] as Word[],
    showPadMap: {} as Record<number, boolean>,
    recognizeResultMap: {} as Record<number, string>,
  },
  onLoad() {
    if (wx.canIUse('getUserProfile')) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
    if (wx.canIUse('input.type.nickname')) {
      this.setData({
        canIUseNicknameComp: true,
      });
    }
    // 初始化首页单词列表（默认展示前5个，避免页面过长）
    this.setData({ words: wordList.slice(0, 5) });
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      },
    });
  },
  getUserInfo(e: any) {
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },
  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;
    this.setData({
      'userInfo.avatarUrl': avatarUrl,
    });
  },
  onInputChange(e: any) {
    this.setData({
      'userInfo.nickName': e.detail.value,
    });
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    });
  },
  startTest() {
    // 跳转到单词列表页面
    wx.navigateTo({
      url: '/pages/wordList/wordList',
    });
  },

  // 首页手写板逻辑
  togglePad(e: any) {
    e && e.stopPropagation && e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    const current = !!this.data.showPadMap[id];
    const showPadMap = { ...this.data.showPadMap, [id]: !current };
    this.setData({ showPadMap }, () => {
      if (!current) {
        this.ensureCanvasContext(id);
      } else {
        this.stopRecognitionTimer(id);
      }
    });
  },

  _ctxMap: {} as Record<number, WechatMiniprogram.CanvasContext>,
  _lastPointMap: {} as Record<number, { x: number; y: number } | null>,
  _timerMap: {} as Record<number, number | null>,
  _isSendingMap: {} as Record<number, boolean>,
  _dirtyMap: {} as Record<number, boolean>,

  ensureCanvasContext(id: number) {
    if (!this._ctxMap[id]) {
      const canvasId = `home-canvas-${id}`;
      const ctx = wx.createCanvasContext(canvasId, this as any);
      ctx.setStrokeStyle('#2d3436');
      ctx.setLineWidth(6);
      ctx.setLineCap('round');
      ctx.setLineJoin('round');
      this._ctxMap[id] = ctx;
      this._lastPointMap[id] = null;
      this._isSendingMap[id] = false;
      this._dirtyMap[id] = false;
    }
  },

  onCanvasTouchStart(e: any) {
    const id = Number(e.currentTarget.dataset.id);
    this.ensureCanvasContext(id);
    const { x, y } = this._extractTouch(e);
    this._lastPointMap[id] = { x, y };
    const ctx = this._ctxMap[id];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    ctx.draw(true);
    this._dirtyMap[id] = true;
    this.startRecognitionTimer(id);
  },

  onCanvasTouchMove(e: any) {
    const id = Number(e.currentTarget.dataset.id);
    this.ensureCanvasContext(id);
    const { x, y } = this._extractTouch(e);
    const last = this._lastPointMap[id];
    const ctx = this._ctxMap[id];
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.draw(true);
    }
    this._lastPointMap[id] = { x, y };
    this._dirtyMap[id] = true;
  },

  onCanvasTouchEnd(e: any) {
    const id = Number(e.currentTarget.dataset.id);
    this._lastPointMap[id] = null;
  },

  clearPad(e: any) {
    e && e.stopPropagation && e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    this.ensureCanvasContext(id);
    const ctx = this._ctxMap[id];
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.draw(false);
    this._dirtyMap[id] = true;
    this.setData({
      recognizeResultMap: { ...this.data.recognizeResultMap, [id]: '' },
    });
  },

  _extractTouch(e: any) {
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    return { x: touch.x, y: touch.y };
  },

  startRecognitionTimer(id: number) {
    if (this._timerMap[id]) return;
    const tick = async () => {
      if (!this.data.showPadMap[id]) {
        this.stopRecognitionTimer(id);
        return;
      }
      if (!this._dirtyMap[id] || this._isSendingMap[id]) return;
      this._isSendingMap[id] = true;
      try {
        const base64 = await this.captureCanvasAsBase64(id);
        const resp = await recognizeHandwriting(base64);
        const word = (resp && resp.word) || '';
        this.setData({
          recognizeResultMap: { ...this.data.recognizeResultMap, [id]: word },
        });
      } catch {
        // ignore errors
      } finally {
        this._isSendingMap[id] = false;
        this._dirtyMap[id] = false;
      }
    };
    this._timerMap[id] = setInterval(tick, 100) as unknown as number;
  },

  stopRecognitionTimer(id: number) {
    const t = this._timerMap[id];
    if (t) {
      clearInterval(t as unknown as number);
      this._timerMap[id] = null;
    }
  },

  async captureCanvasAsBase64(id: number): Promise<string> {
    const canvasId = `home-canvas-${id}`;
    const fs = wx.getFileSystemManager();
    const tempPath = await new Promise<string>((resolve, reject) => {
      wx.canvasToTempFilePath(
        {
          canvasId,
          fileType: 'png',
          quality: 0.9,
          success: (res: any) => resolve(res.tempFilePath),
          fail: (err: any) => reject(err),
        },
        this
      );
    });
    const base64 = await new Promise<string>((resolve, reject) => {
      fs.readFile({
        filePath: tempPath,
        encoding: 'base64',
        success: (res) => resolve(res.data as string),
        fail: reject,
      });
    });
    return base64;
  },
});
