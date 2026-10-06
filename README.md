# TEAM ARCHITECT 2.0

羽曳野店の課題から、初期編成・指揮系統・具体的指示を設計する司令室。現在は段階Bのルール版。生成AIは未接続です。

仕様：[TEAM_ARCHITECT_2_WORK_HANDOFF.md](TEAM_ARCHITECT_2_WORK_HANDOFF.md)
実装と検証：[docs/TEAM_ARCHITECT_B1_QA.md](docs/TEAM_ARCHITECT_B1_QA.md)

## 起動・検証

Node.js 24を利用します。

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run test:interview
npm run build
npx playwright install chromium
npm run test:e2e
```

端末内保存。JSON書出し・追加読込みを提供し、旧データは保持します。
同居する面接対策アプリは`public/interview/`。組織設計とは独立したデータ・機能として保護します。
GitHub Pagesはmainのpushでチェック・ビルド・公開します。
