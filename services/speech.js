// services/speech.js —— 语音合成(TTS) + 语音识别(ASR)
const config = require('./config.js');
const { VOICE_SAMPLES } = require('../data/mock-data.js');

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = wx.createInnerAudioContext();
    audioCtx.obeyMuteSwitch = false; // iOS 硬件静音键下也能朗读
  }
  return audioCtx;
}

/**
 * 文字转语音并播放。
 * @returns {Promise<{mocked:boolean, error?:string}>} 播放结束（或模拟结束）时 resolve
 */
function playTTS({ text, lang }) {
  return new Promise((resolve) => {
    const t = (text || '').trim();
    if (!t) {
      resolve({ mocked: true });
      return;
    }

    if (config.tts.enabled && config.tts.endpoint) {
      // ============== TODO: 接入真实 TTS ==============
      wx.request({
        url: config.tts.endpoint,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: { text: t, lang },
        success: (res) => {
          const data = res.data || {};
          const url = data.audioUrl || data.url;
          if (!url) {
            resolve({ mocked: false, error: 'no-audio' });
            return;
          }
          const ctx = getAudioCtx();
          // 解绑上一轮残留监听，避免累积及交错播放时的串扰
          if (ctx.__onEnd) ctx.offEnded(ctx.__onEnd);
          if (ctx.__onErr) ctx.offError(ctx.__onErr);
          ctx.stop();
          let done = false;
          const finish = (result) => {
            if (done) return; // ended / error 可能都触发，确保只 resolve 一次
            done = true;
            ctx.offEnded(onEnd);
            ctx.offError(onErr);
            ctx.__onEnd = null;
            ctx.__onErr = null;
            resolve(result);
          };
          const onEnd = () => finish({ mocked: false });
          const onErr = () => finish({ mocked: false, error: 'play-error' });
          ctx.__onEnd = onEnd;
          ctx.__onErr = onErr;
          ctx.src = url;
          ctx.onEnded(onEnd);
          ctx.onError(onErr);
          ctx.play();
        },
        fail: () => resolve({ mocked: false, error: 'request-fail' })
      });
      return;
      // ===============================================
    }

    // —— 演示回退：当前环境无离线 TTS，仅模拟朗读时长 ——
    setTimeout(() => resolve({ mocked: true }), 900);
  });
}

function stopTTS() {
  if (audioCtx) audioCtx.stop();
}

/** 是否已配置真实 ASR（决定语音页是否真实录音） */
function asrEnabled() {
  return !!(config.asr.enabled && config.asr.endpoint);
}

/**
 * 上传录音文件做语音识别。
 * @returns {Promise<{text:string}>}
 */
function recognizeAudio({ filePath, from }) {
  return new Promise((resolve, reject) => {
    // ============== TODO: 接入真实 ASR ==============
    wx.uploadFile({
      url: config.asr.endpoint,
      filePath,
      name: 'audio',
      formData: { lang: from },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          resolve({ text: data.text || data.result || '' });
        } catch (e) {
          reject(e);
        }
      },
      fail: reject
    });
    // ===============================================
  });
}

// —— 演示回退：录音识别轮播内置句子 ——
let voiceIdx = 0;
function recognizeMock() {
  const item = VOICE_SAMPLES[voiceIdx % VOICE_SAMPLES.length];
  voiceIdx += 1;
  return item; // { src, tgt }
}

module.exports = {
  playTTS,
  stopTTS,
  asrEnabled,
  recognizeAudio,
  recognizeMock
};
