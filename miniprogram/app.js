// app.js (JS runtime version)
App({
  globalData: {},
  onLaunch() {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    wx.login({
      success: (res) => {
        console.log(res.code);
      },
    });
  },
});

