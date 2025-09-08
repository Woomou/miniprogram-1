import { recognizeHandwriting } from '../../utils/handwritingAPI';

Page({
  data: {
    currentWord: '',
    recognized: '',
  },

  _ctx: null as WechatMiniprogram.CanvasContext | null,
  _last: null as { x: number; y: number } | null,
  _timer: null as number | null,
  _sending: false,
  _dirty: false,

  onLoad(options: any) {
    if (options && options.word) {
      this.setData({ currentWord: options.word });
    }
  },

  onUnload() {
    this.stopTimer();
  },

  ensureCtx() {
    if (!this._ctx) {
      const ctx = wx.createCanvasContext('hw-canvas', this as any);
      ctx.setStrokeStyle('#2d3436');
      ctx.setLineWidth(6);
      ctx.setLineCap('round');
      ctx.setLineJoin('round');
      this._ctx = ctx;
      this._last = null;
      this._sending = false;
      this._dirty = false;
    }
  },

  onCanvasTouchStart(e: any) {
    this.ensureCtx();
    const { x, y } = this._extractTouch(e);
    this._last = { x, y };
    const ctx = this._ctx!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    ctx.draw(true);
    this._dirty = true;
    this.startTimer();
  },

  onCanvasTouchMove(e: any) {
    this.ensureCtx();
    const { x, y } = this._extractTouch(e);
    const last = this._last;
    const ctx = this._ctx!;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.draw(true);
    }
    this._last = { x, y };
    this._dirty = true;
  },

  onCanvasTouchEnd() {
    this._last = null;
  },

  clearPad() {
    this.ensureCtx();
    const ctx = this._ctx!;
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.draw(false);
    this._dirty = true;
    this.setData({ recognized: '' });
  },

  startTimer() {
    if (this._timer) return;
    const tick = async () => {
      if (!this._dirty || this._sending) return;
      this._sending = true;
      try {
        const base64 = await this.captureCanvasAsBase64();
        const resp = await recognizeHandwriting(base64);
        const word = (resp && resp.word) || '';
        this.setData({ recognized: word });
      } catch {
        // ignore
      } finally {
        this._sending = false;
        this._dirty = false;
      }
    };
    this._timer = setInterval(tick, 100) as unknown as number;
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer as unknown as number);
      this._timer = null;
    }
  },

  _extractTouch(e: any) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    return { x: t.x, y: t.y };
  },

  async captureCanvasAsBase64(): Promise<string> {
    const fs = wx.getFileSystemManager();
    const tempPath = await new Promise<string>((resolve, reject) => {
      wx.canvasToTempFilePath(
        {
          canvasId: 'hw-canvas',
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

  goBack() {
    wx.navigateBack();
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
