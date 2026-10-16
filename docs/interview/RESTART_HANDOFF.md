> 最新の使い勝手改善（2026-10-16夜）：過去問の一括取り込み・トップのモードと範囲選択は [IMPORT_UX.md](IMPORT_UX.md) を参照。

> 最新機能（2026-10-16）：本人用の質問・回答追加編集、年月日による過去問検索は [QUESTION_LIBRARY.md](QUESTION_LIBRARY.md) を参照。以下の古い接続状況は当時の記録です。現状確認には AI_CONNECTION.md / AUTH_VOICE_QA.md / DISTINCT_VOICES.md も参照。

# 面接対策 — 再開・停止原因・検証記録

更新: 2026-10-13 JST。対象は `/interview/`。同居するTEAM ARCHITECT本体とは別作業。

## 正本と照合結果

- GitHub: https://github.com/kenkonitteki777-lab/TEAM-ARCHITECT
- アプリ: https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/interview/
- 再開時main: `a590fd2746f2b547e69879df80306b092b651059`。
- `f15cc51`ですでにAI画面・音声入力・聞き取り修正・ログイン・送信同意・追撃・再回答・回答保存が統合済み。再実装しない。
- `a590fd2`ですでに未計測の回答時間を未判定として扱う修正済み。
- `TEAM_ARCHITECT_2_RESTART_HANDOFF.md`は本体の古い再開資料。面接側の最新実装状態にはこの書類と `AI_CONNECTION.md` を使う。

## 停止原因の確認済み事実

- Supabase `interview-coach` はACTIVE、version 4、`verify_jwt=false`（関数内認証）。
- 公開Originを指定したGET応答: `{"ok":true,"aiConfigured":false,"requiresLogin":true}`。
- `public.interview_members where enabled=true` の件数は0。
- したがって現時点のAI未接続は、接続設定・本人利用登録が未完了の状態。ページ全体のフリーズやサーバー停止をこの結果から断定しない。
- OriginなしのGETは403。これはOrigin制限の正常な拒否であり、サーバー停止の根拠にしない。
- APIキーの値や請求設定は取得していない。どの秘密設定が不足かは未確定。

## この変更で直した不具合

AI画面を開く際に入力を空欄へ初期化し、下書き復元は接続・ログイン成功後だけ行っていた。一方、閉じる際には常に下書きを保存していたため、AI未接続・通信失敗・別質問を開いただけでも以前の回答を上書きしていた。

- 接続確認より先に、現在の質問に一致する下書きを復元。
- 回答入力・音声認識・明示的な質問遷移をしていない画面は、下書き保存をしない。
- 接続再確認・ログイン完了時に、入力中の回答を古い下書きへ戻さない。
- readerとHTMLの版指定を更新。保存キーは保持。
- PC/スマホ共通のE2EをCI対象へ追加。

## 動作検証

- `npm run test:interview`: 42件成功。
- `npm run typecheck`: 成功。
- `npm test`: 同居本体43件成功。
- `npm run build`: 成功。
- `tests/e2e/interview-ai.spec.ts`: PC1440px・スマホ390px、合計6件成功。
  - AI未接続・通信失敗時に以前の下書きが維持され、実戦練習へ進める。
  - 別質問の下書きを空欄で上書きしない。
  - 接続応答の代替データを使い、ログイン→同意→評価→端末保存→追撃→再表示→再確認→無料枠エラー時の保持を確認。
  - パスワード・AI画面のトークンが端末保存されないこと、横はみ出しがないことを確認。
- 本物のGroq推論とAndroid実機の音声認識は未検証。代替応答によるテストを実AI品質検証と混同しない。

## 次の未完了部分

1. 所有者のGroq Free Plan・Data Controls・面接専用キー設定の確認。
2. 面接に利用する本人の認証ユーザーを特定して登録。共有プロジェクトの別アプリ利用者を流用しない。
3. 外部送信は画面上の明示同意を継続。別サービス・有料APIへフォールバックしない。
4. 本物の回答で評価根拠・日本語の追撃・失敗時保持を検証。
5. Android実機で音声入力・聞き取り修正・読み上げ・再開を確認。

課金契約、秘密情報のチャット入力、AppDeploy移行、保存データ削除は行わない。まず最新mainとの差分を確認し、同居本体を変更しない。
