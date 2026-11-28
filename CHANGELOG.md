# 更新日志 | Changelog

## v1.0.5-beta

### 改动 | Changes

- 首次进入显示 EULA，并直接读取 `EULA.md` 内容；Accept 后解锁，Decline 后锁定应用交互；不能通过 Esc 或遮罩关闭。
  Shows the EULA on first visit and renders `EULA.md`; Accept unlocks the app, while Decline locks interactions. The dialog cannot be dismissed with Escape or backdrop clicks.
- 设置弹窗【关于】分组增加「查看使用条款 / View EULA」入口，支持只读重新阅读且不改变授权状态。
  Added a View EULA entry under Settings → About for read-only reopening without changing acceptance state.
- 新增 128 × 16 杭州地铁屏幕预设，复用 16 行 HZK16 渲染逻辑，并兼容安全边距与字模设置。
  Added a 128 × 16 Hangzhou Metro preset that reuses 16-row HZK16 rendering and remains compatible with safe-margin and glyph settings.
- China (Mainland) 地区追加四条杭州地铁模板，并补充新增按钮的中英繁简翻译。
  Added four Hangzhou Metro templates for China (Mainland) and English/Simplified-Chinese/Traditional-Chinese translations for new controls.
- 页脚与设置标题更新为 v1.0.5-beta，保留既有亮度、重置、录制、导出和字体功能。
  Updated footer and settings version to v1.0.5-beta while preserving brightness, reset, recording, export and font features.

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

## v1.0.2-beta

- 修复 1280 × 160 标准屏字形采样中单像素笔画间断问题，并改善 HZK16 字模对齐与笔画完整性。
  Fixed single-pixel stroke gaps and improved HZK16 glyph alignment.
- 新增实时字模边界预览及 0–20% 安全边距设置。
  Added live glyph-bounds preview and 0–20% safe-margin setting.

## v1.0.1-beta

- 更新地区选项名称并保留地区偏好持久化。
  Updated region labels and preserved region preference persistence.

## v1.0.0-beta

- 初始开源版本、点阵预设、图片导出、视频录制及自定义字体。
  Initial open-source release with matrix presets, image export, video recording and custom fonts.
