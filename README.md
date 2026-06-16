# 出行翻译 · 微信小程序

面向出国旅行的随身翻译小程序（文本翻译 / 语音对话 / 拍照翻译 / 收藏）。
本工程由原型 `v4-travel-translator.html` 改写为微信小程序原生工程，UI 与交互
按 `出行翻译-开发说明文档.md` 还原。

> 当前翻译 / 语音 / OCR 均走 **服务层 + 演示数据回退**，未接入真实第三方接口；
> 你拿到 API key 后，只需改 `services/config.js` 一处即可切换为真实能力（见下文）。

---

## 一、目录结构

```
├─ app.js / app.json / app.wxss      全局入口、路由、设计变量
├─ project.config.json               开发者工具工程配置（含 appid，需替换）
├─ sitemap.json
├─ components/
│   ├─ icon/                         图标组件（Lucide SVG → data-uri，支持动态颜色/尺寸）
│   └─ nav-bar/                      底部三导航（文本 / 语音中央凸起 / 拍照）
├─ pages/
│   ├─ text/                         文本翻译（首页，默认页）
│   ├─ voice/                        语音对话（全屏沉浸）
│   ├─ camera/                       拍照翻译（全屏取景 + OCR 结果）
│   └─ mine/                         我的（资料 / 统计 / 收藏）
├─ services/
│   ├─ config.js                     ★ 第三方服务配置（你只改这里）
│   ├─ translate.js                  文本翻译
│   ├─ speech.js                     语音合成 TTS + 语音识别 ASR
│   └─ ocr.js                        拍照 OCR + 翻译
├─ data/
│   ├─ phrases.js                    语言列表 + 常用短语包（离线）
│   ├─ icons.js                      图标 path 库
│   └─ mock-data.js                  演示数据（接入真实接口后可忽略）
└─ utils/
    └─ store.js                      收藏 / 统计本地持久化（wx.Storage）
```

---

## 二、本地预览

1. 用 **微信开发者工具** → 导入项目，目录选本工程根目录。
2. `project.config.json` 里的 `appid` 目前是 `touristappid`（游客模式，可直接预览，
   但插件 / 真机部分能力受限）。**正式开发前请改成你自己的小程序 AppID。**
3. 编译即可看到四个页面与全部交互（翻译、朗读、拍照、收藏均以演示数据跑通）。

> 真机调试相机/录音时，请在工具里允许对应权限。

---

## 三、接入真实翻译 / 语音 / OCR（拿到 API key 后）

> 📄 **后端同学请直接看 [`后端对接说明.md`](后端对接说明.md)** —— 内含 4 个接口的请求/响应字段与示例 JSON。

### 第 1 步：填配置

打开 `services/config.js`，把要启用的模块 `enabled` 改为 `true`，填好 `endpoint`
和鉴权字段：

```js
translate: { enabled: true, endpoint: 'https://your-api.com/translate', appKey: '...', appSecret: '...' },
asr:       { enabled: true, endpoint: 'https://your-api.com/asr',  appKey: '...' },
tts:       { enabled: true, endpoint: 'https://your-api.com/tts',  appKey: '...' },
ocr:       { enabled: true, endpoint: 'https://your-api.com/ocr',  appKey: '...' },
```

### 第 2 步：对齐请求 / 返回字段

各服务文件里都用 `// TODO: 接入真实 …` 标出了发请求的位置，按你的接口文档调整：

| 服务 | 文件 | 调用方式 | 期望返回（默认取值） |
| --- | --- | --- | --- |
| 文本翻译 | `services/translate.js` | `wx.request` | `{ translation \| result \| text }` |
| 语音合成 | `services/speech.js` `playTTS` | `wx.request` → 播放音频 | `{ audioUrl \| url }` |
| 语音识别 | `services/speech.js` `recognizeAudio` | `wx.uploadFile` | `{ text \| result }` |
| 拍照识别 | `services/ocr.js` | `wx.uploadFile` | `{ results: [{ src, tgt, note }] }` |

> 启用 ASR 后，语音页会改为**真实录音**（`RecorderManager`）再上传识别；未启用时
> 走内置演示句子，不会请求麦克风权限。

### 第 3 步：登记服务器域名

小程序后台 → **开发管理 → 开发设置 → 服务器域名**，把上面的 `endpoint` 域名
加入 `request 合法域名` 和 `uploadFile 合法域名`（必须 https）。

> 如果你打算用腾讯官方免费的「微信同声传译」插件来做翻译/ASR/TTS，需要在
> 后台 **设置 → 第三方设置 → 插件管理** 添加插件，再在 `app.json` 增加 `plugins`
> 字段并改写 `services/*.js` 调用插件 API（告诉我，我可以按这个方案再接一版）。

---

## 四、已实现 / 待接入

**已实现（前端 + 交互）**
- 四页面与导航：文本（首页）、语音/拍照全屏沉浸、头像进「我的」、底部三导航 + 语音中央蓝色 FAB。
- 文本翻译：输入框右下角朗读、翻译按钮加载动效、译文区朗读/复制/收藏。
- 常用短语：四类切换、朗读、收藏、点正文回填。
- 语音对话：波形、麦克风同心圆脉冲、状态切换、点译文重听（演示循环句）。
- 拍照：真实相机取景、快门动效 + 扫描线、结果卡上滑、每条朗读/收藏。
- 收藏：译文区 / 短语 / 拍照结果三处状态联动，**本地持久化**（刷新不丢），汇入「我的」。

**待接入（已留好接口）**
- 真实翻译 / TTS / ASR / OCR（见第三节）。
- 多语向真实重译（语言选择器已就绪，演示回退固定输出日语示例）。

---

## 五、提交发版步骤

1. 替换 `project.config.json` 的 `appid` 为正式 AppID。
2. 完成第三节接口接入并自测（真机 + 体验版）。
3. 开发者工具右上角 **上传** → 填版本号与项目备注。
4. 小程序后台 → **版本管理 → 提交审核**（首次需先完善 类目 / 隐私协议 / 服务条款）。
5. 审核通过后 **发布上线**。

> 隐私：本程序使用相机（拍照翻译）与麦克风（语音翻译），`app.json` 已声明
> `scope.camera` / `scope.record` 用途。提交审核前请在后台「用户隐私保护指引」
> 勾选对应信息项，否则相机/录音接口在正式版会被拦截。
