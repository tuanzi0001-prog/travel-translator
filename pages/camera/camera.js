// pages/camera —— 拍照翻译（全屏取景 + OCR 结果）
const app = getApp();
const { LANGUAGES } = require('../../data/phrases.js');
const ocr = require('../../services/ocr.js');
const speech = require('../../services/speech.js');
const store = require('../../utils/store.js');

function langByCode(code, fb) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[fb];
}

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    fromLang: LANGUAGES[0],
    toLang: LANGUAGES[2],

    camError: false,
    shooting: false,
    scanning: false,
    showResult: false,
    results: [],
    speakingId: ''
  },

  onLoad() {
    const g = app.globalData;
    const pref = g.langPref || { fromCode: 'zh', toCode: 'ja' };
    this.setData({
      statusBarHeight: g.statusBarHeight,
      safeBottom: g.safeBottom,
      fromLang: langByCode(pref.fromCode, 0),
      toLang: langByCode(pref.toCode, 2)
    });
  },

  onReady() {
    this.cameraCtx = wx.createCameraContext();
  },

  onShow() {
    if (this.data.showResult) this.refreshResultFav();
  },

  onUnload() {
    speech.stopTTS();
  },

  onCamError() {
    this.setData({ camError: true });
  },

  openSetting() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          this.setData({ camError: false });
        }
      }
    });
  },

  onShutter() {
    if (this.data.scanning) return;
    if (this.data.camError || !this.cameraCtx) {
      wx.showToast({ icon: 'none', title: '请授权相机或从相册选择' });
      return;
    }
    this.setData({ shooting: true });
    setTimeout(() => this.setData({ shooting: false }), 400);
    this.cameraCtx.takePhoto({
      quality: 'high',
      success: (res) => this.runOcr(res.tempImagePath),
      fail: () => {
        this.setData({ shooting: false });
        wx.showToast({ icon: 'none', title: '拍照失败，请重试' });
      }
    });
  },

  onGallery() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const f = res.tempFiles && res.tempFiles[0];
        if (f) this.runOcr(f.tempFilePath);
      }
    });
  },

  runOcr(filePath) {
    this.setData({ scanning: true, showResult: false });
    ocr
      .recognizeImage({
        filePath,
        from: this.data.fromLang.code,
        to: this.data.toLang.code
      })
      .then((list) => {
        const results = (list || []).map((r, i) => ({
          id: i + '_' + r.src, // 稳定唯一 key，避免相同 src 导致 wx:key 重复/高亮串台
          src: r.src,
          tgt: r.tgt,
          note: r.note || '',
          faved: store.isFav(r.src)
        }));
        this.setData({ scanning: false, results, showResult: true });
        wx.showToast({ icon: 'none', title: '识别完成 · ' + results.length + ' 段' });
      })
      .catch(() => {
        this.setData({ scanning: false });
        wx.showToast({ icon: 'none', title: '识别失败，请重试' });
      });
  },

  refreshResultFav() {
    const results = this.data.results.map((r) => ({
      id: r.id,
      src: r.src,
      tgt: r.tgt,
      note: r.note,
      faved: store.isFav(r.src)
    }));
    this.setData({ results });
  },

  onResultSpeak(e) {
    const { id, src } = e.currentTarget.dataset;
    this.setData({ speakingId: id });
    speech.playTTS({ text: src, lang: this.data.fromLang.code }).then((r) => {
      this.setData({ speakingId: '' });
      if (r && r.mocked) {
        wx.showToast({ icon: 'none', title: '朗读待接入语音合成服务' });
      }
    });
  },

  onResultFav(e) {
    const { src, tgt } = e.currentTarget.dataset;
    store.toggleFav({ src, tgt, from: this.data.fromLang.code, lang: this.data.toLang.code });
    this.refreshResultFav();
    wx.showToast({
      icon: 'none',
      title: store.isFav(src) ? '已收藏到「我的」' : '已取消收藏'
    });
  },

  closeResult() {
    this.setData({ showResult: false });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: '/pages/text/text' })
    });
  }
});
