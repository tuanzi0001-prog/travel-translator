// pages/mine —— 我的（资料、统计、收藏）
const app = getApp();
const { LANGUAGES, PHRASES, CATEGORIES } = require('../../data/phrases.js');
const store = require('../../utils/store.js');
const speech = require('../../services/speech.js');

const TOTAL_PHRASES = CATEGORIES.reduce((n, c) => n + PHRASES[c].length, 0);

function flagOf(code) {
  const l = LANGUAGES.find((x) => x.code === code);
  return (l && l.flag) || '🌐';
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    capsuleRight: 96,
    safeBottom: 0,
    bodyPadBottom: 120,

    favorites: [],
    favCount: 0,
    translateCount: 0,
    phraseCount: TOTAL_PHRASES,
    speakingSrc: '',
    emptyText: '还没有收藏。\n翻译结果或常用短语点一下 ♡ 就能存到这里。'
  },

  onLoad() {
    const g = app.globalData;
    this.setData({
      statusBarHeight: g.statusBarHeight,
      navBarHeight: g.navBarHeight,
      capsuleRight: g.capsuleRight,
      safeBottom: g.safeBottom,
      bodyPadBottom: g.safeBottom + 40 // 「我的」无底部导航，仅留安全区
    });
  },

  onShow() {
    this.reload();
  },

  reload() {
    const favorites = store.getFavorites().map((f) => ({
      src: f.src,
      tgt: f.tgt,
      lang: f.lang || 'ja',
      fromFlag: flagOf(f.from || 'zh'),
      flag: flagOf(f.lang || 'ja')
    }));
    const stats = store.getStats();
    this.setData({
      favorites,
      favCount: favorites.length,
      translateCount: stats.translateCount
    });
  },

  onSpeak(e) {
    const { src, tgt, lang } = e.currentTarget.dataset;
    this.setData({ speakingSrc: src });
    speech.playTTS({ text: tgt, lang: lang || 'ja' }).then((r) => {
      this.setData({ speakingSrc: '' });
      if (r && r.mocked) {
        wx.showToast({ icon: 'none', title: '朗读待接入语音合成服务' });
      }
    });
  },

  onRemove(e) {
    const { src, tgt } = e.currentTarget.dataset;
    store.toggleFav({ src, tgt }); // 已存在 → 移除
    this.reload();
    wx.showToast({ icon: 'none', title: '已删除' });
  },

  clearAll() {
    if (!this.data.favorites.length) return;
    wx.showModal({
      title: '清空收藏',
      content: '确定要清空全部收藏吗？',
      confirmColor: '#2f6fe0',
      success: (res) => {
        if (res.confirm) {
          store.clearFavorites();
          this.reload();
          wx.showToast({ icon: 'none', title: '已清空收藏' });
        }
      }
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: '/pages/text/text' })
    });
  }
});
