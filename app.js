// app.js —— 全局入口
App({
  globalData: {
    statusBarHeight: 20, // 状态栏高度(px)
    navBarHeight: 44, // 自定义导航条高度(px)，与右上角胶囊对齐
    headerHeight: 64, // 状态栏 + 导航条 (px)
    capsuleRight: 96, // 右侧需要避让胶囊的宽度(px)
    safeBottom: 0, // 底部安全区(px)，用于底部导航避让 Home Indicator
    windowWidth: 375,
    langPref: { fromCode: 'zh', toCode: 'ja' } // 当前语向，文本页修改后语音/拍照页共享
  },

  onLaunch() {
    try {
      const win =
        typeof wx.getWindowInfo === 'function'
          ? wx.getWindowInfo()
          : wx.getSystemInfoSync();
      const menu = wx.getMenuButtonBoundingClientRect();

      const statusBarHeight = win.statusBarHeight || 20;
      // 标准计算：导航条高度 = (胶囊顶 - 状态栏) * 2 + 胶囊高
      const navBarHeight =
        menu && menu.height
          ? (menu.top - statusBarHeight) * 2 + menu.height
          : 44;

      this.globalData.statusBarHeight = statusBarHeight;
      this.globalData.navBarHeight = navBarHeight;
      this.globalData.headerHeight = statusBarHeight + navBarHeight;
      this.globalData.windowWidth = win.windowWidth || 375;
      // 右侧避让宽度 = 屏宽 - 胶囊左边缘 + 间距
      this.globalData.capsuleRight = menu
        ? win.windowWidth - menu.left + 8
        : 96;

      const safeArea = win.safeArea;
      this.globalData.safeBottom = safeArea
        ? (win.screenHeight || win.windowHeight) - safeArea.bottom
        : 0;
    } catch (e) {
      // 兜底使用默认值
      console.warn('[出行翻译] 读取系统信息失败，使用默认布局参数', e);
    }
  }
});
