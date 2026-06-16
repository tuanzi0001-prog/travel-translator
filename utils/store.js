// utils/store.js —— 收藏与统计的本地持久化（wx.Storage）
const FAV_KEY = 'cxy_favorites';
const STAT_KEY = 'cxy_stats';

function getFavorites() {
  return wx.getStorageSync(FAV_KEY) || [];
}

function isFav(src) {
  return getFavorites().some((f) => f.src === src);
}

/**
 * 切换收藏；返回切换后的状态（true=已收藏）
 * @param {Object} p { src, tgt, from, lang }
 *   from 源语言 code（默认 'zh'）、lang 译文语言 code（默认 'ja'）——用于朗读与双旗徽标
 */
function toggleFav({ src, tgt, from, lang }) {
  const list = getFavorites();
  const i = list.findIndex((f) => f.src === src);
  let faved;
  if (i >= 0) {
    list.splice(i, 1);
    faved = false;
  } else {
    list.unshift({ src, tgt, from: from || 'zh', lang: lang || 'ja' });
    faved = true;
  }
  wx.setStorageSync(FAV_KEY, list);
  return faved;
}

function clearFavorites() {
  wx.setStorageSync(FAV_KEY, []);
}

function getStats() {
  const s = wx.getStorageSync(STAT_KEY) || {};
  return {
    translateCount: s.translateCount || 0,
    countries: s.countries || 0
  };
}

function bumpTranslateCount() {
  const s = getStats();
  s.translateCount += 1;
  wx.setStorageSync(STAT_KEY, s);
  return s.translateCount;
}

module.exports = {
  getFavorites,
  isFav,
  toggleFav,
  clearFavorites,
  getStats,
  bumpTranslateCount
};
