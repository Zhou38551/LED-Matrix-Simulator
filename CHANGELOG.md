# 更新日志 | Changelog

## beta 1.0.1

### 改动 | Changes

- 更新地区选项显示名称为 China (Mainland) 和 China (Hong Kong, Macao, Taiwan)，并保留 UK、USA；对应的简体中文、繁体中文和英文语言映射不变。
  Updated the region labels to China (Mainland) and China (Hong Kong, Macao, Taiwan), while keeping UK and USA unchanged; the Simplified Chinese, Traditional Chinese, and English locale mappings remain unchanged.

- 修复地区切换的实时 DOM 文本更新，地区变更后立即生效，无需刷新页面。
  Fixed live DOM text updates when switching regions; locale changes now apply immediately without a page refresh.

- 修复动态文本监听的重复更新问题，确保观察器不产生反馈循环，并确保初始化时清理旧监听器。
  Fixed duplicate dynamic-text updates: the observer no longer creates feedback loops, and prior listeners are cleaned up during initialization.

- 保留 localStorage 地区设置持久化；未改动 main.js 点阵渲染逻辑，并保持多文件结构。
  Preserved region preference persistence in localStorage; left the matrix rendering logic in main.js unchanged and retained the multi-file structure.

## v1.0.0-beta

### 改动 | Changes

- 初始开源版本
  Initial open-source release

- 修复录制一圈无法自动停止 bug
  Fixed bug: recording would not auto-stop after one full scroll loop

- 修复静态模式后台动画循环空转
  Fixed idle background animation loop under static display mode

- 修复字号计算 Infinity 导致白屏
  Fixed white-screen crash caused by infinite font-size calculation

- 修复 HZK16 模式静态文字偏移、居中错位
  Fixed text offset / mis-centering issue for HZK16 static mode

- 切换屏幕 / 模式自动停止录制，防止流异常
  Auto-stop recording when switching panel / display mode to avoid stream exceptions

- UI 状态栏区分滚动 / 静态状态
  Status bar now distinguishes scroll / static mode

- 修复标准屏文字被压扁、离屏采样比例不一致
  Fixed distorted (squashed) glyphs on the standard panel; offscreen sampling now keeps a square aspect ratio

- 支持两种点阵规格，图片导出，视频录制，自定义字体
  Two matrix presets, PNG export, video recording, custom font import supported
