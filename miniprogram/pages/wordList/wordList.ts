import { wordList, Word } from '../../utils/wordData';
import { recognizeHandwriting } from '../../utils/handwritingAPI';

Page({
  data: {
    wordList: [] as Word[],
    // 控制每个词条是否展示手写板
    showPadMap: {} as Record<number, boolean>,
    // 最近识别结果
    recognizeResultMap: {} as Record<number, string>,
  },

  onLoad() {
    this.initWordList();
  },

  initWordList() {
    this.setData({
      wordList,
    });
  },

  togglePad(e: any) {
    e && e.stopPropagation && e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    const current = !!this.data.showPadMap[id];
    const showPadMap = { ...this.data.showPadMap, [id]: !current };
    this.setData({ showPadMap }, () => {
      if (!current) {
        // 初始化画布
        this.ensureCanvasContext(id);
      } else {
        // 关闭时清理定时器
        this.stopRecognitionTimer(id);
      }
    });
  },

  selectWord(e: any) {
    const word = e.currentTarget.dataset.word;

    // 跳转到读音测试页面
    wx.navigateTo({
      url: `/pages/pronunciation/pronunciation?word=${encodeURIComponent(JSON.stringify(word))}`,
    });
  },

  // 画布与绘制逻辑
  _ctxMap: {} as Record<number, WechatMiniprogram.CanvasContext>,
  _lastPointMap: {} as Record<number, { x: number; y: number } | null>,
  _timerMap: {} as Record<number, number | null>,
  _isSendingMap: {} as Record<number, boolean>,
  _dirtyMap: {} as Record<number, boolean>,

  ensureCanvasContext(id: number) {
    if (!this._ctxMap[id]) {
      const canvasId = `canvas-${id}`;
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
    ctx.lineTo(x + 0.1, y + 0.1); // kick off a small dot
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
    // 保留定时器运行，由_dirtyMap控制是否发送（未变化则不发）
  },

  clearPad(e: any) {
    e && e.stopPropagation && e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    this.ensureCanvasContext(id);
    const ctx = this._ctxMap[id];
    // 清空画布：用一个透明矩形覆盖
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.draw(false);
    this._dirtyMap[id] = true; // 触发一次空白发送
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
      if (!this._dirtyMap[id]) {
        return; // 没有变化就不发送
      }
      if (this._isSendingMap[id]) {
        return; // 还在发送，本次略过
      }
      this._isSendingMap[id] = true;
      try {
        const base64 = await this.captureCanvasAsBase64(id);
        const resp = await recognizeHandwriting(base64);
        const word = resp && (resp.word || '');
        this.setData({
          recognizeResultMap: { ...this.data.recognizeResultMap, [id]: word },
        });
      } catch {
        // 静默失败，避免频繁 toast
      } finally {
        this._isSendingMap[id] = false;
        this._dirtyMap[id] = false;
      }
    };
    // 100ms 周期
    const timer = setInterval(tick, 100) as unknown as number;
    this._timerMap[id] = timer;
  },

  stopRecognitionTimer(id: number) {
    const t = this._timerMap[id];
    if (t) {
      clearInterval(t as unknown as number);
      this._timerMap[id] = null;
    }
  },

  async captureCanvasAsBase64(id: number): Promise<string> {
    const canvasId = `canvas-${id}`;
    const fs = wx.getFileSystemManager();
    const tempPath = await new Promise<string>((resolve, reject) => {
      // 兼容回调版本
      wx.canvasToTempFilePath(
        {
          canvasId,
          fileType: 'png',
          quality: 0.9,
          success: (res: any) => resolve(res.tempFilePath),
          fail: (_err: any) => reject(_err),
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
