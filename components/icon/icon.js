// components/icon —— 把 Lucide SVG 以 base64 data-uri 渲染为 <image>，支持动态颜色/尺寸
// 用 base64（而非 URL 编码）形式，<image> 在各端/真机上的兼容性更稳妥。
const ICONS = require('../../data/icons.js');

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function utf8Bytes(str) {
  const out = [];
  for (let i = 0; i < str.length; i += 1) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = str.charCodeAt((i += 1));
      const cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return out;
}

function base64(str) {
  const bytes = utf8Bytes(str);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    out += B64[b1 >> 2];
    out += B64[((b1 & 3) << 4) | ((b2 === undefined ? 0 : b2) >> 4)];
    out += b2 === undefined ? '=' : B64[((b2 & 15) << 2) | ((b3 === undefined ? 0 : b3) >> 6)];
    out += b3 === undefined ? '=' : B64[b3 & 63];
  }
  return out;
}

function buildSrc(name, color, stroke) {
  const inner = ICONS[name];
  if (!inner) return '';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' +
    color +
    '" stroke-width="' +
    stroke +
    '" stroke-linecap="round" stroke-linejoin="round">' +
    inner +
    '</svg>';
  return 'data:image/svg+xml;base64,' + base64(svg);
}

Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 36 }, // rpx
    color: { type: String, value: '#1b2a4a' },
    stroke: { type: Number, value: 2 }
  },
  data: { src: '' },
  observers: {
    'name, color, stroke': function (name, color, stroke) {
      this.setData({ src: buildSrc(name, color, stroke) });
    }
  },
  lifetimes: {
    attached() {
      this.setData({
        src: buildSrc(this.data.name, this.data.color, this.data.stroke)
      });
    }
  }
});
