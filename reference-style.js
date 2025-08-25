// Draft UI Schema v0.2 (by JS preferred)
// 目标：描述层级/组件/样式/状态/交互，不绑定具体前端框架。
// 尺寸单位：rem & %；颜色使用语义 token；图标用语义名。
const Draft = {
    meta: {
      screenId: "study-screen",
      title: "学习",
      theme: {
        colors: {
          bg:   { base: "#FFFFFF" },
          brand:{ 50:"#F2EAFE", 400:"#8B5CF6", 500:"#7C3AED", 600:"#6D28D9" },
          text: { primary:"#111827", secondary:"#6B7280", muted:"#9CA3AF", inverse:"#FFFFFF" },
          chip: { bg:"#F3F4F6", active:"#E0E7FF" },
          accent:{ orange:"#FF7A1A" },
          card: { bg:"#FFFFFF", border:"#E5E7EB" }
        },
        radius: { sm: 8, md: 12, lg: 16, xl: 24 },
        shadow: { card:"0 6px 24px rgba(17,24,39,0.06)" },
        spacing: { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }
      }
    },
  
    layout: {
      type: "stack",
      children: [
  
        // 顶部渐变 AppBar
        {
          id: "appbar",
          type: "AppBar",
          props: {
            height: 64,
            background: { gradient:["brand.50","brand.400"] },
            leftActions: [
              { type:"IconButton", icon:"chevron-left", a11yLabel:"返回", onTap:"nav.back" }
            ],
            title: { text:"学习", align:"center", color:"text.inverse", weight:"600" }
          }
        },
  
        // 全屏滚动内容
        {
          id: "scroll",
          type: "ScrollView",
          props: { paddingX:"xl", paddingY:"lg", background:"bg.base" },
          children: [
  
            // 词汇 chips（book / ruler / pencil / …）
            {
              id: "top-chips",
              type: "ChipRow",
              props: { wrap:true, gap:"sm" },
              items: [
                { text:"book",    state:"default" },
                { text:"ruler",   state:"default" },
                { text:"pencil",  state:"default" },
                { text:"teacher", state:"disabled", iconLeft:"strike" },
                { text:"I",       state:"default" },
                { text:"have",    state:"default" },
                { text:"a",       state:"default" },
                { text:"an",      state:"default" }
              ]
            },
  
            // 学/读/选/拆/一/拼/一/写 —— 步骤 Tabs
            {
              id: "step-tabs",
              type: "Tabs",
              props: { variant:"pill", activeIndex:0, gap:"sm" },
              items: [
                { key:"learn",  label:"学" },
                { key:"read",   label:"读" },
                { key:"choose", label:"选" },
                { key:"split1", label:"拆" },
                { key:"hyphen1",label:"一", disabled:true },
                { key:"spell",  label:"拼" },
                { key:"hyphen2",label:"一", disabled:true },
                { key:"write",  label:"写" }
              ]
            },
  
            // 主词卡：school
            {
              id: "word-card",
              type: "Card",
              props: { padding:"xxl", radius:"xl", shadow:"card" },
              children: [
                {
                  id: "word-title",
                  type: "Text",
                  props: {
                    text: "school",
                    color: "accent.orange",
                    fontSize: 56,
                    weight: "800",
                    letterSpacing: 0.5
                  }
                },
  
                // 组合提示：school | bag（浅黄标签）
                {
                  id: "compose-hints",
                  type: "ChipRow",
                  props: { gap:"sm", marginTop:"md" },
                  items: [
                    { text:"school", tone:"warning", filled:true },
                    { text:"bag",    tone:"warning", filled:true }
                  ]
                },
  
                // 音标 + 发音按钮
                {
                  id: "ipa-row",
                  type: "Row",
                  props: { align:"center", gap:"sm", marginTop:"lg" },
                  children: [
                    { type:"Text", props:{ text:"/ˈskuːlˌbæɡ/", color:"text.secondary", fontSize:18 } },
                    { type:"IconButton", props:{ icon:"volume", a11yLabel:"播放发音", onTap:"audio.playWord" } }
                  ]
                },
  
                // 词性与词义
                {
                  id: "meaning-row",
                  type: "Row",
                  props: { gap:"sm", marginTop:"sm" },
                  children: [
                    { type:"Text", props:{ text:"n.", color:"text.secondary" } },
                    { type:"Text", props:{ text:"书包", color:"text.primary" } },
                    { type:"Link", props:{ text:"详解", onTap:"nav.toDetail" } }
                  ]
                },
  
                // 音素 chips
                {
                  id: "phoneme-chips",
                  type: "ChipRow",
                  props: { gap:"sm", marginTop:"xl" },
                  items: [
                    { text:"/s/" }, { text:"/k/" }, { text:"/uː/" }, { text:"/l/" },
                    { text:"/b/" }, { text:"/æ/" }, { text:"/g/" }
                  ]
                },
  
                // 两个操作按钮：自然拼读/音节拆分
                {
                  id: "actions",
                  type: "Row",
                  props: { gap:"lg", marginTop:"xl" },
                  children: [
                    { type:"Button", props:{ variant:"outline", text:"自然拼读", onTap:"mode.phonics" } },
                    { type:"Button", props:{ variant:"filled",  text:"音节拆分", onTap:"mode.syllable" } }
                  ]
                }
              ]
            },
  
            // 词根助记卡
            {
              id: "mnemonic-card",
              type: "Card",
              props: { marginTop:"xl", padding:"lg", radius:"lg", border:"card.border" },
              children: [
                { type:"Badge", props:{ text:"词根助记" } },
  
                {
                  type: "EquationRow",
                  props: { marginTop:"md", gap:"md" },
                  children: [
                    { type:"Token", props:{ text:"school", subText:"学校", tone:"info" } },
                    { type:"Text",  props:{ text:"+", color:"text.muted" } },
                    { type:"Token", props:{ text:"bag", subText:"包", tone:"info" } },
                    { type:"Text",  props:{ text:"=", color:"text.muted" } },
                    { type:"Token", props:{ text:"schoolbag", strong:true } }
                  ]
                },
  
                { type:"Text", props:{
                  marginTop:"sm",
                  color:"text.secondary",
                  text:"去学校要背的包，即书包"
                }}
              ]
            },
  
            // 实用口语区
            {
              id: "usage-card",
              type: "Card",
              props: { marginTop:"xl", padding:"lg", radius:"lg" },
              children: [
                { type:"Badge", props:{ text:"实用口语" } },
                { type:"RichText", props:{
                  marginTop:"md",
                  html:'I left my <b>school</b> bag on the playground.'
                }}
              ]
            },
  
            // 底部主按钮
            {
              id: "cta",
              type: "Button",
              props: {
                marginTop:"xl",
                size:"lg",
                text:"练习",
                fullWidth:true,
                onTap:"nav.toPractice"
              }
            }
          ]
        }
      ]
    },
  
    // 交互逻辑（仅声明意图）
    actions: {
      "nav.back":        { type:"NAVIGATE_BACK" },
      "nav.toDetail":    { type:"NAVIGATE", to:"/word/school/detail" },
      "nav.toPractice":  { type:"NAVIGATE", to:"/practice?word=school" },
      "audio.playWord":  { type:"AUDIO_PLAY", src:"/audio/schoolbag.mp3" },
      "mode.phonics":    { type:"SET_STATE", key:"mode", value:"phonics" },
      "mode.syllable":   { type:"SET_STATE", key:"mode", value:"syllable" }
    },
  
    // 可选：响应式与可访问性
    responsive: {
      breakpoints: {
        sm: { wordTitleFont: 40, paddingX:"md" },
        md: { wordTitleFont: 48 },
        lg: { wordTitleFont: 56 }
      }
    },
    a11y: {
      landmarks: [
        { id:"word-card", role:"main", label:"词汇学习" },
        { id:"mnemonic-card", role:"region", label:"词根助记" },
        { id:"usage-card", role:"region", label:"实用口语" }
      ]
    }
  };
  export default Draft;