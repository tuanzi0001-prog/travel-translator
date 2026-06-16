// services/ocr.js —— 拍照 OCR + 翻译
const config = require('./config.js');
const { OCR_RESULTS } = require('../data/mock-data.js');

/**
 * 识别图片中的文字并翻译。
 * @param {Object} p
 * @param {string} p.filePath 本地图片临时路径
 * @param {string} p.from 源语言 code
 * @param {string} p.to   目标语言 code
 * @returns {Promise<Array<{src:string, tgt:string, note?:string}>>}
 */
function recognizeImage({ filePath, from, to }) {
  return new Promise((resolve, reject) => {
    if (config.ocr.enabled && config.ocr.endpoint) {
      // ============== TODO: 接入真实 OCR + 翻译 ==============
      wx.uploadFile({
        url: config.ocr.endpoint,
        filePath,
        name: 'image',
        formData: { from, to },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            // 期望返回 { results: [{ src, tgt, note }] }
            resolve(data.results || []);
          } catch (e) {
            reject(e);
          }
        },
        fail: reject
      });
      return;
      // =====================================================
    }

    // —— 演示回退（未配置真实接口时）——
    setTimeout(() => resolve(OCR_RESULTS.slice()), 1000);
  });
}

module.exports = { recognizeImage };
