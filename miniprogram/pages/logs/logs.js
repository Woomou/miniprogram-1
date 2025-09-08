const { formatTime } = require('../../utils/util.js');

Component({
  data: {
    logs: [],
  },
  lifetimes: {
    attached() {
      this.setData({
        logs: (wx.getStorageSync('logs') || []).map((log) => {
          return {
            date: formatTime(new Date(log)),
            timeStamp: log,
          };
        }),
      });
    },
  },
});

