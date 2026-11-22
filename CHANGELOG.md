# 更新日志 | Changelog

## beta 1.0.1

### 改动 | Changes

- 新增地区驱动的简体中文、繁体中文和英文界面切换，选择后即时生效并保存设置，页面加载时自动恢复。
  Added region-based Simplified Chinese, Traditional Chinese, and English UI switching. Changes apply immediately, are saved, and are restored on page load.

- 地区选项保留 China（大陆）、China（港澳台）、UK 和 USA。
  Retained the region options China (Mainland), China (Hong Kong, Macau & Taiwan), UK, and USA.

- 更新页面版本号至 beta 1.0.1。
  Updated the page version to beta 1.0.1.

- 保持多文件结构，未修改 main.js 的点阵渲染逻辑。
  Kept the multi-file structure and left the matrix rendering logic in main.js unchanged.

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
