// components/nav-bar —— 底部三导航（文本 / 语音中央凸起 / 拍照）
Component({
  properties: {
    // 当前页：'text' 时左侧 tab 高亮；'mine' 等其他值则无高亮
    active: { type: String, value: '' },
    // 底部安全区(px)，避让 Home Indicator
    safeBottom: { type: Number, value: 0 }
  },
  methods: {
    onText() {
      if (this.data.active === 'text') return;
      // 「我的」等页面返回到文本首页
      wx.navigateBack({
        delta: 1,
        fail: () => wx.reLaunch({ url: '/pages/text/text' })
      });
    },
    onVoice() {
      wx.navigateTo({ url: '/pages/voice/voice' });
    },
    onCamera() {
      wx.navigateTo({ url: '/pages/camera/camera' });
    }
  }
});
