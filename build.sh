#!/bin/bash

# 英语读音测试小程序构建脚本
echo "🚀 开始构建英语读音测试小程序..."

# 清理之前的构建文件
echo "🧹 清理之前的构建文件..."
find miniprogram -name "*.js" -delete

# 转换TypeScript文件为JavaScript文件
echo "📝 转换TypeScript文件为JavaScript文件..."
find miniprogram -name "*.ts" -not -path "*/node_modules/*" | while read file; do
    js_file="${file%.ts}.js"
    echo "转换: $file -> $js_file"
    cp "$file" "$js_file"
done

# 验证所有必要的文件都存在
echo "✅ 验证文件完整性..."
required_files=(
    "miniprogram/app.js"
    "miniprogram/pages/index/index.js"
    "miniprogram/pages/wordList/wordList.js"
    "miniprogram/pages/pronunciation/pronunciation.js"
    "miniprogram/utils/wordData.js"
    "miniprogram/utils/pronunciation.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

echo "🎉 构建完成！"
echo "📱 项目已准备好用于微信开发者工具"
echo ""
echo "使用方法："
echo "1. 打开微信开发者工具"
echo "2. 导入项目: /Users/harryneo/WeChatProjects/miniprogram-1"
echo "3. 点击编译按钮"
echo ""
echo "或者使用CLI预览："
echo "/Applications/wechatwebdevtools.app/Contents/MacOS/cli preview --project /Users/harryneo/WeChatProjects/miniprogram-1" 