# 贡献指南 | Contributing

感谢你愿意参与本项目！欢迎提交 Issue 与 Pull Request。

Thanks for your interest in contributing! Issues and pull requests are welcome.

## 反馈问题 | Reporting Issues

- 请附上浏览器型号与版本、操作系统、复现步骤和截图。
  Include your browser and version, operating system, reproduction steps, and screenshots.
- 描述预期行为与实际行为的差异。
  Describe the expected behavior versus the actual behavior.

## 提交代码 | Pull Requests

1. Fork 本仓库并新建分支：`feature/你的改动` 或 `fix/你的修复`。
   Fork the repo and create a branch: `feature/your-change` or `fix/your-fix`.
2. 保持单文件结构，不引入框架与打包工具；改动集中在 `index.html` 内。
   Keep the single-file structure; do not add frameworks or bundlers. Keep changes inside `index.html`.
3. 自测两种点阵规格、静态与滚动模式下显示正常。
   Self-test both matrix presets under static and scrolling modes.
4. 在 `CHANGELOG.md` 中追加本次改动（中英双语）。
   Append your change to `CHANGELOG.md` in both Chinese and English.
5. 提交信息使用清晰、简洁的英文或中文描述。
   Write clear and concise commit messages in English or Chinese.

## 代码规范 | Code Style

- 原生 ES6+，避免外部依赖。
  Vanilla ES6+; avoid external dependencies.
- 缩进 2 空格，字符串风格保持与现有代码一致。
  Use 2-space indentation; match the existing string style.
- 不使用 `console.log` 调试残留。
  Remove leftover `console.log` debugging statements.

## 行为准则 | Code of Conduct

请友善、尊重地交流，不接受人身攻击或歧视性言论。

Please communicate respectfully; personal attacks and discriminatory language are not tolerated.
