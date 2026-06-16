// pages/text —— 文本翻译（首页）
const app = getApp();
const { LANGUAGES, PHRASES, CATEGORIES, CATEGORY_META } = require('../../data/phrases.js');
const store = require('../../utils/store.js');
const translateSvc = require('../../services/translate.js');
const speech = require('../../services/speech.js');

const DEFAULT_SRC = '请问这附近有去东京站的地铁吗？';
const DEFAULT_RESULT = {
  text: 'この近くに東京駅へ行く地下鉄はありますか？',
  note: '更自然的旅行表达：请对方指路时，可以加上「すみません」更礼貌。'
};

// 常用短语包是固定的日语资源（与 data/phrases.js 的 tgt 语言一致），
// 其旗标/朗读语言/标签不随目标语言选择器变化。
const PHRASE_LANG = 'ja';
const PHRASE_FLAG = '🇯🇵';
const FAV_CAT = '我的收藏'; // 短语区里额外的「我的收藏」分类
const FAV_META = { emoji: '⭐', color: '#ff7d5e' }; // 收藏用珊瑚色，呼应♥

// 分类芯片：名称 + emoji + 主题色（增加配色层次）。「我的收藏」放在第一个。
const CHIPS = [
  { name: FAV_CAT, emoji: FAV_META.emoji, color: FAV_META.color }
].concat(
  CATEGORIES.map((c) => ({
    name: c,
    emoji: CATEGORY_META[c].emoji,
    color: CATEGORY_META[c].color
  }))
);

function flagOf(code) {
  const l = LANGUAGES.find((x) => x.code === code);
  return (l && l.flag) || '🌐';
}
function labelOf(code) {
  const l = LANGUAGES.find((x) => x.code === code);
  return (l ? l.name : '日本語') + '译文';
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    capsuleRight: 96,
    safeBottom: 0,
    bodyPadBottom: 120,

    languages: LANGUAGES,
    langNames: LANGUAGES.map((l) => l.name),
    fromIndex: 0,
    toIndex: 2,
    fromLang: LANGUAGES[0],
    toLang: LANGUAGES[2],
    swapSpin: false,
    showFromDropdown: false,
    showToDropdown: false,

    sourceText: DEFAULT_SRC,
    result: DEFAULT_RESULT,
    resultLangLabel: LANGUAGES[2].name + '译文',
    translating: false,
    srcSpeaking: false,
    resSpeaking: false,
    resFaved: false,

    chips: CHIPS,
    activeCat: CATEGORIES[0],
    phraseList: [],
    favCatActive: false,
    speakingSrc: ''
  },

  onLoad() {
    const g = app.globalData;
    this.setData({
      statusBarHeight: g.statusBarHeight,
      navBarHeight: g.navBarHeight,
      capsuleRight: g.capsuleRight,
      safeBottom: g.safeBottom,
      bodyPadBottom: g.safeBottom + 120
    });
    this.persistLangPref();
    this.renderPhrases();
    this.syncResFav();
  },

  persistLangPref() {
    app.globalData.langPref = {
      fromCode: this.data.fromLang.code,
      toCode: this.data.toLang.code
    };
  },

  onShow() {
    // 收藏可能在「我的」「拍照」页变化，回到本页同步状态
    this.renderPhrases();
    this.syncResFav();
  },

  renderPhrases() {
    let list;
    if (this.data.activeCat === FAV_CAT) {
      list = store.getFavorites().map((f) => ({
        src: f.src,
        tgt: f.tgt,
        lang: f.lang || 'ja',
        fromCode: f.from || 'zh',
        fromFlag: flagOf(f.from || 'zh'),
        toFlag: flagOf(f.lang || 'ja'),
        faved: true
      }));
    } else {
      list = (PHRASES[this.data.activeCat] || []).map((p) => ({
        src: p.src,
        tgt: p.tgt,
        lang: PHRASE_LANG,
        fromCode: 'zh',
        fromFlag: '🇨🇳',
        toFlag: PHRASE_FLAG,
        faved: store.isFav(p.src)
      }));
    }
    this.setData({
      phraseList: list,
      favCatActive: this.data.activeCat === FAV_CAT
    });
  },

  syncResFav() {
    this.setData({
      resFaved: store.isFav((this.data.sourceText || '').trim())
    });
  },

  onInput(e) {
    this.setData({ sourceText: e.detail.value });
  },

  toggleFromDropdown() {
    this.setData({
      showFromDropdown: !this.data.showFromDropdown,
      showToDropdown: false
    });
  },
  toggleToDropdown() {
    this.setData({
      showToDropdown: !this.data.showToDropdown,
      showFromDropdown: false
    });
  },
  closeDropdowns() {
    this.setData({ showFromDropdown: false, showToDropdown: false });
  },
  onFromSelect(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData(
      { fromIndex: idx, fromLang: this.data.languages[idx], showFromDropdown: false },
      () => this.persistLangPref()
    );
  },
  onToSelect(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const lang = this.data.languages[idx];
    this.setData(
      {
        toIndex: idx,
        toLang: lang,
        resultLangLabel: lang.name + '译文',
        showToDropdown: false
      },
      () => this.persistLangPref()
    );
  },

  onSwap() {
    const { fromIndex, toIndex, languages, sourceText, result } = this.data;
    // 交换语向，同时对调原文/译文，避免“新语向标签 + 旧译文”的矛盾显示
    this.setData(
      {
        swapSpin: !this.data.swapSpin,
        fromIndex: toIndex,
        toIndex: fromIndex,
        fromLang: languages[toIndex],
        toLang: languages[fromIndex],
        resultLangLabel: languages[fromIndex].name + '译文',
        sourceText: result.text || '',
        result: { text: sourceText || '', note: '' }
      },
      () => {
        this.persistLangPref();
        this.syncResFav();
      }
    );
  },

  onTranslate() {
    const text = (this.data.sourceText || '').trim();
    if (!text) {
      wx.showToast({ icon: 'none', title: '请输入要翻译的内容' });
      return;
    }
    if (this.data.translating) return;
    this.setData({ translating: true });
    translateSvc
      .translateText({
        text,
        from: this.data.fromLang.code,
        to: this.data.toLang.code
      })
      .then((res) => {
        store.bumpTranslateCount();
        this.setData({
          translating: false,
          result: { text: res.text, note: res.note },
          resultLangLabel: this.data.toLang.name + '译文'
        });
        this.syncResFav();
      })
      .catch(() => {
        this.setData({ translating: false });
        wx.showToast({ icon: 'none', title: '翻译失败，请重试' });
      });
  },

  onSpeakSrc() {
    const t = (this.data.sourceText || '').trim();
    if (!t) {
      wx.showToast({ icon: 'none', title: '请先输入文字' });
      return;
    }
    this.setData({ srcSpeaking: true });
    speech.playTTS({ text: t, lang: this.data.fromLang.code }).then((r) => {
      this.setData({ srcSpeaking: false });
      if (r && r.mocked) this.ttsHint();
    });
  },

  onSpeakRes() {
    const t = this.data.result.text;
    if (!t) return;
    this.setData({ resSpeaking: true });
    speech.playTTS({ text: t, lang: this.data.toLang.code }).then((r) => {
      this.setData({ resSpeaking: false });
      if (r && r.mocked) this.ttsHint();
    });
  },

  ttsHint() {
    if (this._ttsHinted) return;
    this._ttsHinted = true;
    wx.showToast({ icon: 'none', title: '朗读待接入语音合成服务' });
    setTimeout(() => {
      this._ttsHinted = false;
    }, 4000);
  },

  onCopy() {
    const t = this.data.result.text;
    if (!t) return;
    wx.setClipboardData({ data: t });
  },

  onToggleResFav() {
    const src = (this.data.sourceText || '').trim();
    if (!src) {
      wx.showToast({ icon: 'none', title: '请先翻译一句话' });
      return;
    }
    const faved = store.toggleFav({
      src,
      tgt: this.data.result.text,
      from: this.data.fromLang.code,
      lang: this.data.toLang.code
    });
    // 收藏后切到「我的收藏」（第一个分类），让用户直接看到刚存的内容
    this.setData(faved ? { resFaved: faved, activeCat: FAV_CAT } : { resFaved: faved });
    this.renderPhrases();
    wx.showToast({ icon: 'none', title: faved ? '已收藏到「我的」' : '已取消收藏' });
  },

  onCatTap(e) {
    this.setData({ activeCat: e.currentTarget.dataset.cat });
    this.renderPhrases();
  },

  onPhraseTap(e) {
    const { src, tgt, lang } = e.currentTarget.dataset;
    this.setData({
      sourceText: src,
      result: { text: tgt, note: '已填入上方，可朗读或继续编辑。' },
      resultLangLabel: labelOf(lang || 'ja')
    });
    this.syncResFav();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onPhraseSpeak(e) {
    const { src, tgt, lang } = e.currentTarget.dataset;
    this.setData({ speakingSrc: src });
    speech.playTTS({ text: tgt, lang: lang || PHRASE_LANG }).then((r) => {
      this.setData({ speakingSrc: '' });
      if (r && r.mocked) this.ttsHint();
    });
  },

  onPhraseFav(e) {
    const { src, tgt, from, lang } = e.currentTarget.dataset;
    store.toggleFav({ src, tgt, from: from || 'zh', lang: lang || PHRASE_LANG });
    const nowFaved = store.isFav(src);
    // 新增收藏后切到「我的收藏」分类
    if (nowFaved && this.data.activeCat !== FAV_CAT) {
      this.setData({ activeCat: FAV_CAT });
    }
    this.renderPhrases();
    this.syncResFav();
    wx.showToast({
      icon: 'none',
      title: nowFaved ? '已收藏到「我的」' : '已取消收藏'
    });
  },

  goMine() {
    wx.navigateTo({ url: '/pages/mine/mine' });
  }
});
