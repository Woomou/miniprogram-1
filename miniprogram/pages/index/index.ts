// index.ts

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseNicknameComp: false,
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
});
