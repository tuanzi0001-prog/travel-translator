// data/mock-data.js —— 演示用数据
// 当 services/config.js 未配置真实接口时，服务层会回退到这里的模拟数据，
// 以保证小程序在未接入第三方服务前也能完整跑通交互。接入 API 后可忽略本文件。

// 文本翻译演示映射：原文 -> 译文
const TRANSLATIONS = {
  '请问这附近有去东京站的地铁吗？': 'この近くに東京駅へ行く地下鉄はありますか？',
  '请问这附近有药店吗？': 'この近くに薬局はありますか？',
  '我想去最近的药店。': '一番近い薬局に行きたいです。',
  '请问这家店可以退税吗？': 'このお店で免税手続きはできますか？'
};

// 语音识别(ASR)演示：录音后轮播返回的句子（原文 + 译文）
const VOICE_SAMPLES = [
  { src: '请问这里可以帮我叫出租车吗？', tgt: 'ここでタクシーを呼んでもらえますか？' },
  { src: '请问这家店几点关门？', tgt: 'このお店は何時に閉まりますか？' },
  { src: '可以帮我推荐一道招牌菜吗？', tgt: 'おすすめの看板メニューはありますか？' }
];

// 拍照 OCR 演示：识别返回的多段结果
const OCR_RESULTS = [
  {
    src: '主厨海鲜意面',
    tgt: "Chef's seafood pasta",
    note: '建议追问是否含贝类'
  },
  {
    src: '含贝类（过敏提示）',
    tgt: 'Contains shellfish',
    note: '过敏人群请注意'
  }
];

module.exports = { TRANSLATIONS, VOICE_SAMPLES, OCR_RESULTS };
