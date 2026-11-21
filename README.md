# LED Matrix Simulator · LED 点阵模拟器

> 版本 / Version: **v1.0.0-beta**

一个纯前端、零依赖的 LED 点阵滚动屏模拟器，双击 `index.html` 即可在浏览器中运行，无需后端、无需构建工具。

A dependency-free, pure-frontend LED matrix scrolling sign simulator. Open `index.html` directly in a browser — no backend, no build step required.

## 特性 | Features

- 两种点阵规格：1280 × 160 标准屏（320 × 40 网格）与 384 × 16 超宽屏（HZK16）
  Two matrix presets: 1280 × 160 standard panel (320 × 40 grid) and 384 × 16 wide panel (HZK16)
- 静态居中与公交滚动两种显示模式
  Static centered and bus-departure scrolling display modes
- 自定义字体导入（.TTF / .OTF / .WOFF）
  Custom font import (.TTF / .OTF / .WOFF)
- 字号、缩放、阈值、滚动速度、LED 颜色可调
  Adjustable font size, scale, threshold, scroll speed, and LED color
- 导出 PNG 图片，录制 WebM 视频
  Export PNG image and record WebM video
- 长文本自适应，物理级边界居中，循环滚动
  Long-text auto-fit, physical edge centering, seamless loop

## 快速开始 | Quick Start

1. 下载或克隆本仓库。
   Download or clone this repository.
2. 用现代浏览器（Chrome / Edge / Firefox）打开 `index.html`。
   Open `index.html` with a modern browser (Chrome / Edge / Firefox).
3. 在左侧面板输入文字、调整参数，即时预览点阵效果。
   Type text and adjust parameters in the left panel to preview the matrix output in real time.

## 目录结构 | Project Structure

```
LED-Matrix-Simulator/
├── index.html          # 主程序（HTML + CSS + JS 内联）| App (inline HTML/CSS/JS)
├── README.md           # 项目说明 | Project documentation
├── LICENSE             # MIT 许可证 | MIT license
├── CHANGELOG.md        # 更新日志 | Release changelog
├── CONTRIBUTING.md     # 贡献指南 | Contribution guide
├── .gitignore          # Git 忽略规则 | Git ignore rules
└── screenshots/        # 预览截图 | Preview screenshots
```

## 技术栈 | Tech Stack

- 原生 HTML5 / CSS3 / JavaScript（ES6+）
  Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- 无框架、无打包工具、无外部运行时依赖
  No framework, no bundler, no external runtime dependency
- 渲染基于 Canvas 2D 离屏采样到点阵网格
  Rendering uses an offscreen Canvas 2D sampled down to the matrix grid

## 已知限制 | Known Limitations

- 标准屏超长文本超出屏宽后会被裁剪；超长内容建议使用超宽屏模式。
  On the standard panel, text wider than the screen is clipped; use the wide panel for long content.
- 视频录制受浏览器 MediaRecorder 限制，仅输出 WebM 格式。
  Video recording is limited by the browser MediaRecorder and outputs WebM only.
- Safari 兼容性较差，建议使用 Chrome / Edge / Firefox。
  Compatibility with Safari is limited; Chrome / Edge / Firefox are recommended.

## 许可证 | License

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE)。

This project is open-sourced under the MIT license. See [LICENSE](LICENSE) for details.
