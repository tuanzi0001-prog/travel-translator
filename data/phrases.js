// data/phrases.js —— 语言列表 + 常用短语包（离线可用）
// 短语默认演示语向：中文 → 日本語（与原型一致）。
// 接入翻译 API 后，可按 to 语向对短语目标译文做动态重译。

const LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

// 分类 -> [{ src: 原文, tgt: 译文 }]
const PHRASES = {
  机场海关: [
    { src: '请问值机柜台在哪里？', tgt: 'チェックインカウンターはどこですか？' },
    { src: '请问登机口在哪里？', tgt: '搭乗ゲートはどこですか？' },
    { src: '我是来旅游的。', tgt: '観光で来ました。' },
    { src: '行李提取处在哪里？', tgt: '手荷物受取所はどこですか？' },
    { src: '这个可以带上飞机吗？', tgt: 'これは機内に持ち込めますか？' }
  ],
  餐厅点餐: [
    { src: '请给我看一下菜单。', tgt: 'メニューを見せてください。' },
    { src: '有什么推荐的吗？', tgt: 'おすすめは何ですか？' },
    { src: '请给我来一份这个。', tgt: 'これをください。' },
    { src: '我对花生过敏。', tgt: 'ピーナッツアレルギーがあります。' },
    { src: '可以打包吗？', tgt: '持ち帰りできますか？' },
    { src: '请结账。', tgt: 'お会計をお願いします。' }
  ],
  酒店入住: [
    { src: '我想办理入住。', tgt: 'チェックインをお願いします。' },
    { src: '我有预订。', tgt: '予約しています。' },
    { src: '请问几点退房？', tgt: 'チェックアウトは何時ですか？' },
    { src: 'Wi-Fi 密码是多少？', tgt: 'Wi-Fiのパスワードは何ですか？' },
    { src: '可以帮我寄存行李吗？', tgt: '荷物を預かってもらえますか？' }
  ],
  紧急求助: [
    { src: '请帮帮我。', tgt: '助けてください。' },
    { src: '请叫救护车。', tgt: '救急車を呼んでください。' },
    { src: '请帮我报警。', tgt: '警察を呼んでください。' },
    { src: '我的护照丢了。', tgt: 'パスポートをなくしました。' },
    { src: '最近的医院在哪里？', tgt: '一番近い病院はどこですか？' },
    { src: '我身体不舒服。', tgt: '気分が悪いです。' }
  ]
};

const CATEGORIES = Object.keys(PHRASES);

// 每个分类一个主题色 + emoji，用来增加配色层次与生活感
const CATEGORY_META = {
  机场海关: { emoji: '✈️', color: '#4b8df8' },
  餐厅点餐: { emoji: '🍜', color: '#ff922b' },
  酒店入住: { emoji: '🏨', color: '#1fc1a6' },
  紧急求助: { emoji: '🆘', color: '#ff5d6c' }
};

module.exports = { LANGUAGES, PHRASES, CATEGORIES, CATEGORY_META };
