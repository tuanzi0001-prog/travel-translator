// services/translate.js —— 文本翻译服务
const config = require('./config.js');
const { TRANSLATIONS } = require('../data/mock-data.js');

/**
 * 翻译一段文本。
 * @param {Object} p
 * @param {string} p.text 原文
 * @param {string} p.from 源语言 code（zh/en/ja...）
 * @param {string} p.to   目标语言 code
 * @returns {Promise<{text:string, note:string}>}
 */
function translateText({ text, from, to }) {
  const q = (text || '').trim();
  return new Promise((resolve, reject) => {
    if (!q) {
      resolve({ text: '', note: '' });
      return;
    }

    if (config.translate.enabled && config.translate.endpoint) {
      // ============== TODO: 接入真实翻译 API ==============
      wx.request({
        url: config.translate.endpoint,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          q,
          from,
          to
          // 这里按你的接口补充鉴权字段，例如：
          // appKey: config.translate.appKey, sign, salt 等
        },
        success: (res) => {
          // 按你的接口返回结构取出译文字段
          const data = res.data || {};
          const t = data.translation || data.result || data.text;
          if (t) resolve({ text: t, note: buildNote(q) });
          else reject(new Error('翻译接口返回为空'));
        },
        fail: reject
      });
      return;
      // ===================================================
    }

    // —— 演示回退（未配置真实接口时）——
    setTimeout(() => {
      resolve({
        text:
          TRANSLATIONS[q] ||
          'すみません、もう一度ゆっくり言っていただけますか？',
        note: buildNote(q)
      });
    }, 650);
  });
}

function buildNote(text) {
  return text.length > 24
    ? '长句建议拆成两句，现场沟通更容易被对方听懂。'
    : '适合当面展示给对方，也可以点击朗读。';
}

module.exports = { translateText };
