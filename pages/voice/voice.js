// pages/voice —— 语音对话（沉浸式翻译大屏）
const app = getApp();
const { LANGUAGES } = require('../../data/phrases.js');
const speech = require('../../services/speech.js');
const translateSvc = require('../../services/translate.js');

function langByCode(code, fallbackIndex) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[fallbackIndex];
}

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    bars: Array.from({ length: 20 }, (_, i) => i),

    fromLang: LANGUAGES[0], // 中文
    toLang: LANGUAGES[2], // 日本語

    listening: false,
    voiceStatus: '点击下方麦克风，对着说话',
    recordHint: '点击说话',
    vtSource: '请问这个车到银座吗？',
    vtTarget: 'この電車は銀座に行きますか？'
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

  onUnload() {
    speech.stopTTS();
    if (this.recorder && this.data.listening) {
      try {
        this.recorder.stop();
      } catch (e) {}
    }
  },

  onRecordTap() {
    if (this.data.listening) this.stopListening();
    else this.startListening();
  },

  startListening() {
    this.setData({
      listening: true,
      recordHint: '再次点击结束',
      voiceStatus: '正在聆听…'
    });
    if (speech.asrEnabled()) {
      this.startRecorder();
    } else {
      // 演示：预取本轮要识别的句子
      this._pending = speech.recognizeMock();
      this.setData({ vtSource: this._pending.src, vtTarget: '翻译中…' });
    }
  },

  stopListening() {
    this.setData({
      listening: false,
      recordHint: '点击说话',
      voiceStatus: '正在翻译…'
    });
    if (speech.asrEnabled()) {
      this.stopRecorder();
    } else {
      const item = this._pending;
      setTimeout(() => {
        this.setData({
          vtSource: item.src,
          vtTarget: item.tgt,
          voiceStatus: '已翻译 · 可朗读给对方'
        });
        this.speak(item.tgt);
      }, 650);
    }
  },

  // —— 真实录音 + ASR 路径（config.asr.enabled 为 true 时启用）——
  initRecorder() {
    const rec = wx.getRecorderManager();
    rec.onStop((res) => {
      this.setData({ voiceStatus: '正在识别…' });
      speech
        .recognizeAudio({ filePath: res.tempFilePath, from: this.data.fromLang.code })
        .then(({ text }) => {
          const src = text || '（未识别到语音）';
          this.setData({ vtSource: src, vtTarget: '翻译中…', voiceStatus: '正在翻译…' });
          return translateSvc.translateText({
            text: src,
            from: this.data.fromLang.code,
            to: this.data.toLang.code
          });
        })
        .then((r) => {
          this.setData({ vtTarget: r.text, voiceStatus: '已翻译 · 可朗读给对方' });
          this.speak(r.text);
        })
        .catch(() => this.setData({ voiceStatus: '识别失败，请重试' }));
    });
    rec.onError(() => {
      this.setData({ listening: false, voiceStatus: '录音失败，请检查麦克风权限' });
    });
    this.recorder = rec;
  },

  startRecorder() {
    if (!this.recorder) this.initRecorder();
    this.recorder.start({
      format: 'mp3',
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1
    });
  },

  stopRecorder() {
    if (this.recorder) this.recorder.stop();
  },

  speak(text) {
    speech.playTTS({ text, lang: this.data.toLang.code }).then((r) => {
      if (r && r.mocked) {
        wx.showToast({ icon: 'none', title: '朗读待接入语音合成服务' });
      }
    });
  },

  onReplay() {
    const t = this.data.vtTarget;
    if (t && t !== '翻译中…') this.speak(t);
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: '/pages/text/text' })
    });
  }
});
