# 更新日志 | Changelog

## v1.0.4-beta

### 改动 | Changes

- 将地区、重置、显示、字模渲染、导出录制和关于信息整合到设置弹窗；重置操作需二次确认。
  Consolidated region, reset, display, glyph rendering, export/recording, and about settings into the dialog; reset requires two confirmations.
- 新增亮度、网格背景、灯珠边框、安全边距、导出格式及录制帧率预设，并保存显示偏好。
  Added brightness, grid background, LED bead borders, safe margin, default export format, and recording frame-rate presets with persisted display preferences.
- 将屏幕比例/字模模式入口放入字模渲染设置，并添加仓库链接。
  Moved panel-size/sampling-mode controls into glyph rendering settings and added a repository link.
- 更新当前版本标记为 v1.0.4-beta；保留原有滚动、渲染、字体、颜色、图片导出及视频录制功能。
  Updated the current version to v1.0.4-beta while retaining existing scrolling, rendering, font, color, image-export, and video-recording features.

## v1.0.3-beta

### 改动 | Changes

- 设置弹窗右上角使用红色圆点关闭按钮，移除标题左侧的关闭符号，并保留 Esc 关闭。
  Replaced the title-side close mark with a red top-right dot button; Escape-to-close remains available.
- 设置弹窗及其内部面板改为直角，并将设置按钮移至页面头部右上角。
  Made the settings dialog and its inner panels square-cornered, and moved the Settings button to the top-right of the page header.
- 首次访问默认使用英文，已有地区偏好不变并继续通过 localStorage 保存。
  English is the default on first visit; existing region preferences are preserved and continue to be stored in localStorage.
- 更新页脚版本号；保留点阵渲染、滚动与录制、字体导入、颜色预设、多文件结构及设置持久化。
  Updated the footer version while preserving matrix rendering, scrolling and recording, font import, color presets, the multi-file structure, and settings persistence.

## v1.0.2-beta

### 改动 | Changes

- 修复 1280 × 160 标准屏字形采样中单像素笔画间断问题，并改善 HZK16 字模对齐与笔画完整性。
  Fixed single-pixel stroke gaps during 1280 × 160 standard-panel glyph sampling and improved HZK16 glyph alignment and stroke completeness.
- 新增实时字模边界预览，显示实际字模范围及安全区域。
  Added a live glyph-bounds preview showing the sampled glyph bounds and safe area.
- 新增 0–20% 安全边距设置，调整点阵文字尺寸，减少贴边裁切风险。
  Added a 0–20% safe-margin setting that scales the rasterized text to reduce edge clipping.
- 保留地区语言切换、地区设置及项目多文件结构。
  Preserved region/language switching, region settings, and the multi-file project structure.

## beta 1.0.1

### 改动 | Changes

- 更新地区选项显示名称为 China (Mainland) 和 China (Hong Kong, Macao, Taiwan)，并保留 UK、USA；对应的简体中文、繁体中文和英文语言映射不变。
  Updated the region labels to China (Mainland) and China (Hong Kong, Macao, Taiwan), while keeping UK and USA unchanged; locale mappings remain Simplified Chinese, Traditional Chinese, and English.
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
  Fixed distorted glyphs on the standard panel; offscreen sampling keeps the correct aspect ratio
- 支持两种点阵规格，图片导出，视频录制，自定义字体
  Two matrix presets, PNG export, video recording, and custom font import supported
