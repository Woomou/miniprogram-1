{
    "type": "ui.draft",
    "schemaVersion": "1.0",
    "id": "study-screen",
    "meta": {
      "title": "学习",
      "description": "Vocabulary learning screen for 'school/schoolbag'",
      "i18n": ["zh-CN", "en"]
    },
    "theme": {
      "colors": {
        "bg.base": "#FFFFFF",
        "brand.50": "#F2EAFE",
        "brand.400": "#8B5CF6",
        "brand.500": "#7C3AED",
        "text.primary": "#111827",
        "text.secondary": "#6B7280",
        "text.muted": "#9CA3AF",
        "text.inverse": "#FFFFFF",
        "chip.bg": "#F3F4F6",
        "chip.active": "#E0E7FF",
        "accent.orange": "#FF7A1A",
        "card.border": "#E5E7EB"
      },
      "radius": { "sm": 8, "md": 12, "lg": 16, "xl": 24 },
      "shadow": { "card": "0 6px 24px rgba(17,24,39,0.06)" },
      "spacing": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "xxl": 32 }
    },
    "layout": {
      "type": "stack",
      "children": [
        {
          "id": "appbar",
          "type": "AppBar",
          "props": {
            "height": 64,
            "background": { "gradient": ["brand.50", "brand.400"] },
            "title": { "text": "学习", "align": "center", "color": "text.inverse", "weight": "600" },
            "leftActions": [
              { "type": "IconButton", "icon": "chevron-left", "a11yLabel": "返回", "onTap": "nav.back" }
            ]
          }
        },
        {
          "id": "scroll",
          "type": "ScrollView",
          "props": { "paddingX": "xl", "paddingY": "lg", "background": "bg.base" },
          "children": [
            {
              "id": "top-chips",
              "type": "ChipRow",
              "props": { "wrap": true, "gap": "sm" },
              "items": [
                { "text": "book" }, { "text": "ruler" }, { "text": "pencil" },
                { "text": "teacher", "state": "disabled", "iconLeft": "strike" },
                { "text": "I" }, { "text": "have" }, { "text": "a" }, { "text": "an" }
              ]
            },
            {
              "id": "step-tabs",
              "type": "Tabs",
              "props": { "variant": "pill", "activeIndex": 0, "gap": "sm" },
              "items": [
                { "key": "learn", "label": "学" },
                { "key": "read", "label": "读" },
                { "key": "choose", "label": "选" },
                { "key": "split1", "label": "拆" },
                { "key": "hyphen1", "label": "一", "disabled": true },
                { "key": "spell", "label": "拼" },
                { "key": "hyphen2", "label": "一", "disabled": true },
                { "key": "write", "label": "写" }
              ]
            },
            {
              "id": "word-card",
              "type": "Card",
              "props": { "padding": "xxl", "radius": "xl", "shadow": "card" },
              "children": [
                {
                  "id": "word-title",
                  "type": "Text",
                  "props": {
                    "text": "school",
                    "color": "accent.orange",
                    "fontSize": 56,
                    "weight": "800",
                    "letterSpacing": 0.5
                  }
                },
                {
                  "id": "compose-hints",
                  "type": "ChipRow",
                  "props": { "gap": "sm", "marginTop": "md" },
                  "items": [
                    { "text": "school", "tone": "warning", "filled": true },
                    { "text": "bag", "tone": "warning", "filled": true }
                  ]
                },
                {
                  "id": "ipa-row",
                  "type": "Row",
                  "props": { "align": "center", "gap": "sm", "marginTop": "lg" },
                  "children": [
                    { "type": "Text", "props": { "text": "/ˈskuːlˌbæɡ/", "color": "text.secondary", "fontSize": 18 } },
                    { "type": "IconButton", "props": { "icon": "volume", "a11yLabel": "播放发音", "onTap": "audio.playWord" } }
                  ]
                },
                {
                  "id": "meaning-row",
                  "type": "Row",
                  "props": { "gap": "sm", "marginTop": "sm" },
                  "children": [
                    { "type": "Text", "props": { "text": "n.", "color": "text.secondary" } },
                    { "type": "Text", "props": { "text": "书包", "color": "text.primary" } },
                    { "type": "Link", "props": { "text": "详解", "onTap": "nav.toDetail" } }
                  ]
                },
                {
                  "id": "phoneme-chips",
                  "type": "ChipRow",
                  "props": { "gap": "sm", "marginTop": "xl" },
                  "items": [
                    { "text": "/s/" }, { "text": "/k/" }, { "text": "/uː/" }, { "text": "/l/" },
                    { "text": "/b/" }, { "text": "/æ/" }, { "text": "/g/" }
                  ]
                },
                {
                  "id": "actions",
                  "type": "Row",
                  "props": { "gap": "lg", "marginTop": "xl" },
                  "children": [
                    { "type": "Button", "props": { "variant": "outline", "text": "自然拼读", "onTap": "mode.phonics" } },
                    { "type": "Button", "props": { "variant": "filled", "text": "音节拆分", "onTap": "mode.syllable" } }
                  ]
                ]
              ]
            },
            {
              "id": "mnemonic-card",
              "type": "Card",
              "props": { "marginTop": "xl", "padding": "lg", "radius": "lg", "border": "card.border" },
              "children": [
                { "type": "Badge", "props": { "text": "词根助记" } },
                {
                  "type": "Row",
                  "props": { "marginTop": "md", "gap": "md" },
                  "children": [
                    { "type": "Token", "props": { "text": "school", "subText": "学校", "tone": "info" } },
                    { "type": "Text", "props": { "text": "+", "color": "text.muted" } },
                    { "type": "Token", "props": { "text": "bag", "subText": "包", "tone": "info" } },
                    { "type": "Text", "props": { "text": "=", "color": "text.muted" } },
                    { "type": "Token", "props": { "text": "schoolbag", "strong": true } }
                  ]
                },
                {
                  "type": "Text",
                  "props": { "marginTop": "sm", "color": "text.secondary", "text": "去学校要背的包，即书包" }
                }
              ]
            },
            {
              "id": "usage-card",
              "type": "Card",
              "props": { "marginTop": "xl", "padding": "lg", "radius": "lg" },
              "children": [
                { "type": "Badge", "props": { "text": "实用口语" } },
                {
                  "type": "RichText",
                  "props": { "marginTop": "md", "html": "I left my <b>school</b> bag on the playground." }
                }
              ]
            },
            {
              "id": "cta",
              "type": "Button",
              "props": { "marginTop": "xl", "size": "lg", "text": "练习", "fullWidth": true, "onTap": "nav.toPractice" }
            }
          ]
        }
      ]
    },
    "actions": {
      "nav.back": { "type": "NAVIGATE_BACK" },
      "nav.toDetail": { "type": "NAVIGATE", "to": "/word/school/detail" },
      "nav.toPractice": { "type": "NAVIGATE", "to": "/practice?word=school" },
      "audio.playWord": { "type": "AUDIO_PLAY", "src": "/audio/schoolbag.mp3" },
      "mode.phonics": { "type": "SET_STATE", "key": "mode", "value": "phonics" },
      "mode.syllable": { "type": "SET_STATE", "key": "mode", "value": "syllable" }
    },
    "responsive": {
      "breakpoints": {
        "sm": { "overrides": { "word-title.props.fontSize": 40, "scroll.props.paddingX": "md" } },
        "md": { "overrides": { "word-title.props.fontSize": 48 } },
        "lg": { "overrides": { "word-title.props.fontSize": 56 } }
      }
    },
    "a11y": {
      "landmarks": [
        { "role": "main", "ref": "word-card", "label": "词汇学习" },
        { "role": "region", "ref": "mnemonic-card", "label": "词根助记" },
        { "role": "region", "ref": "usage-card", "label": "实用口语" }
      ]
    }
  }