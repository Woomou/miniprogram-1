# 英语读音准确度测试小程序

这是一个基于微信小程序的英语读音准确度测试应用，帮助用户练习和评估英语单词的发音。

## 功能特性

### 🎯 核心功能

- **单词列表选择**：提供多个英语单词供用户选择测试
- **语音录制**：支持麦克风录音功能
- **发音识别**：分析用户发音并生成识别结果
- **准确度评估**：计算发音准确度百分比
- **错误标注**：标出发音错误的部分
- **智能反馈**：提供个性化的发音改进建议

### 📱 页面结构

1. **单词列表页面** (`pages/wordList/`)
   - 显示可测试的单词列表
   - 包含单词、音标和中文含义
   - 点击单词进入测试页面

2. **读音测试页面** (`pages/pronunciation/`)
   - 显示目标单词信息
   - 录音功能（点击麦克风按钮）
   - 识别结果展示
   - 准确度评分
   - 发音建议

### 🛠 技术实现

#### 录音功能

- 使用微信小程序 `wx.getRecorderManager()` API
- 支持录音权限管理
- 音频格式：MP3，采样率16kHz

#### 语音识别

- 当前使用模拟识别结果
- 可集成第三方语音识别服务：
  - 百度语音识别
  - 腾讯云语音识别
  - 阿里云语音识别
  - 讯飞语音识别

#### 准确度算法

- 基于编辑距离算法计算相似度
- 分析元音和辅音错误
- 生成详细的发音反馈

## 项目结构

```
miniprogram-1/
├── miniprogram/
│   ├── pages/
│   │   ├── wordList/          # 单词列表页面
│   │   │   ├── wordList.wxml
│   │   │   ├── wordList.scss
│   │   │   ├── wordList.ts
│   │   │   └── wordList.json
│   │   └── pronunciation/     # 读音测试页面
│   │       ├── pronunciation.wxml
│   │       ├── pronunciation.scss
│   │       ├── pronunciation.ts
│   │       └── pronunciation.json
│   ├── utils/
│   │   └── pronunciation.ts   # 发音分析工具类
│   ├── app.json              # 应用配置
│   ├── app.scss              # 全局样式
│   └── app.ts                # 应用入口
├── project.config.json       # 项目配置
└── README.md                 # 项目说明
```

## 使用方法

### 开发环境设置

1. 下载并安装微信开发者工具
2. 导入项目到微信开发者工具
3. 配置小程序AppID（如需要）

### 运行项目

1. 在微信开发者工具中打开项目
2. 点击"编译"按钮
3. 在模拟器中预览效果

### 真机测试

1. 在微信开发者工具中点击"预览"
2. 使用微信扫描二维码
3. 在手机上体验完整功能

## 配置说明

### 权限配置

在 `app.json` 中已配置录音权限：

```json
{
  "permission": {
    "scope.record": {
      "desc": "用于语音识别和读音测试"
    }
  }
}
```

### 页面路由

在 `app.json` 中配置页面路径：

```json
{
  "pages": ["pages/wordList/wordList", "pages/pronunciation/pronunciation"]
}
```

## 扩展功能

### 集成真实语音识别API

1. 在 `utils/pronunciation.ts` 中修改 `SpeechRecognitionService.recognizeSpeech` 方法
2. 调用第三方语音识别API
3. 处理API返回的识别结果

### 添加更多单词

在 `pages/wordList/wordList.ts` 的 `initWordList` 方法中添加更多单词数据。

### 优化准确度算法

在 `utils/pronunciation.ts` 中改进 `PronunciationAnalyzer` 类的算法。

## 注意事项

1. **录音权限**：首次使用需要用户授权录音权限
2. **网络连接**：语音识别功能需要网络连接
3. **音频质量**：建议在安静环境中进行录音测试
4. **兼容性**：支持微信小程序基础库 2.0.0 及以上版本

## 技术栈

- **框架**：微信小程序原生开发
- **语言**：TypeScript
- **样式**：SCSS
- **语音识别**：模拟实现（可扩展为真实API）

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
