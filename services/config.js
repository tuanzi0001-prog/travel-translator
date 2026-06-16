// services/config.js
// ============================================================
//  第三方服务配置 —— 你拿到 API key 后，只需要改这一个文件
// ============================================================
//  · 把对应模块的 enabled 改为 true，并填好 endpoint / 鉴权字段；
//  · 未配置（enabled=false）时，服务层自动回退到 data/mock-data.js 的演示数据，
//    小程序依旧可以完整跑通所有交互；
//  · endpoint 必须是 https，且需在「小程序后台 → 开发管理 → 开发设置 →
//    服务器域名 → request/uploadFile 合法域名」中登记。
//
//  各服务的请求 / 返回结构见根目录《后端对接说明.md》（含示例 JSON），
//  对应 services/*.js 里也有 TODO 标注。
// ============================================================

module.exports = {
  // 文本翻译
  translate: {
    enabled: false,
    endpoint: '', // 例：https://your-api.com/translate
    appKey: '',
    appSecret: ''
  },

  // 语音识别 ASR（录音转文字）
  asr: {
    enabled: false,
    endpoint: '', // 例：https://your-api.com/asr
    appKey: ''
  },

  // 语音合成 TTS（文字转语音）
  tts: {
    enabled: false,
    endpoint: '', // 例：https://your-api.com/tts，返回音频地址
    appKey: ''
  },

  // 拍照 OCR + 翻译
  ocr: {
    enabled: false,
    endpoint: '', // 例：https://your-api.com/ocr
    appKey: ''
  }
};
