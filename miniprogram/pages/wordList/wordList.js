const { wordList } = require('../../utils/wordData');

Page({
  data: {
    wordList: [],
  },

  onLoad() {
    this.initWordList();
  },

  initWordList() {
    this.setData({
      wordList,
    });
  },

  selectWord(e) {
    const word = e.currentTarget.dataset.word;

    // 跳转到读音测试页面
    wx.navigateTo({
      url: `/pages/pronunciation/pronunciation?word=${encodeURIComponent(JSON.stringify(word))}`,
    });
  },
});