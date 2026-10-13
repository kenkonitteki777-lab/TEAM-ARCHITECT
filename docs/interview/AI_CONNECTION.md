# 面接AI接続準備（2026-10-12）

ログイン・パスワード再設定・端末音声の2026-10-14の変更と必要なRedirect URLは [AUTH_VOICE_QA.md](./AUTH_VOICE_QA.md) を参照。

2026-10-13の再開時の停止原因・修正・検証・未完了項目は [RESTART_HANDOFF.md](./RESTART_HANDOFF.md) を参照。AI画面統合を繰り返さない。

## 現在の状態

通常の質問・模範解答と実戦5問は無料で公開中。
AIのサーバー処理・ブラウザー用クライアント・AI実戦画面を統合。ログイン、音声入力、聞き取り修正、評価、追撃、再回答、回答と弱点の保存を実装。音声回答の実機検証と本物の推論評価は未完了。
2026-10-14: 所有者が面接専用キーと無料プラン確認フラグを登録。公開GETで `aiConfigured:true` を確認。所有者申告でGroq Free TierとZDR設定を確認。本人が作成したメール確認済み・非匿名の認証アカウント1名に面接利用権限を登録し、データベースで確認した。公開リポジトリにはメールアドレス・ユーザーID・秘密情報を記録しない。

接続設定と本人登録は完了。次は本人が公開アプリのAI面接画面でログインし、送信同意の上で実回答を評価する。実Groq推論・Android音声認識はまだ未検証。AIキーの有効性は実推論成功まで確認済みと扱わない。

## 承認して接続する構成

GitHub Pages → 面接専用のSupabase Edge Function → Groq Free Plan。
既存の面接用プロジェクトを利用し、MOCOMOのプロジェクト・秘密情報は使わない。
この関数はJWTをAuth APIで検証し、interview_membersで本人利用権限を確認する。
既存の verify_jwt=false は関数内の独自認証を継続するために維持。

- INTERVIEW_GROQ_API_KEY：面接専用のGroqキー。ブラウザー・GitHub・チャットに貼らない。
- INTERVIEW_GROQ_FREE_CONFIRMED：Free Planと請求設定を所有者が確認した後にtrue。
- 無料のGPT-OSS 120Bを使用。有料OpenAIや別アプリのキーへのフォールバックなし。
- 既存の1日30回制限と同時アクセス制限を継続。Groqの無料枠に達したら429で停止する。
- Groqアカウントを有料化すると請求の可能性が変わるため、Free Planの維持が条件。アプリだけではアカウントのプランを検証できない。
- 回答文・直前の会話・任意で登録した事実と模範解答をGroqに送信する。現在は送信していない。接続前に本人承認が必要。
- GroqのData ControlsでZero Data Retentionを設定する。ログ・バックアップにAPIキーを記録しない。

## 接続前に必要な本人操作・確認

1. Groq Free Planアカウントを用意し、面接専用キーをSupabaseのEdge Function Secretsに登録。
2. 本人が面接で使う認証アカウントを確認し、そのユーザーだけinterview_membersに登録する。
3. 回答文をGroqへ送信する方式について本人承認を得る。
4. 統合したAI画面で、実機の日本語の聞き取りと本物の推論・保存・再出題を検証。

公開画面はキーの入力を求めない。ログイン・明示同意・利用権限がなければAIを呼ばない。

## 評価契約

15軸、弱点、短いフィードバック、次に直す一つ、次の追撃1問を返す。
引用は今回の回答に存在する文字列だけ受け付け、捏造した引用は拒否する。
社長は結論・利益・数字・責任、部長は経験・育成・イズム・店長行動を重視。
本人の数値・失敗・経験を作らない。スコアは練習上の評価で、合否予測にはしない。

## 確認資料

- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/structured-outputs
- https://console.groq.com/docs/your-data
- https://supabase.com/docs/guides/functions/secrets

## 接続先を選ぶ理由と検証の区別

- Geminiの日本向け無料サービスの規約は、入力・出力の改善利用と人による確認を説明し、個人情報・機密情報を送らないよう求めている。本人の経験・店舗数字を扱う無料用途には選ばない。
- OpenAI APIはChatGPT Plusとは別請求。今回の追加課金なしという条件に使える契約・キーは確認できていない。
- Groqは無料枠、GPT-OSS 120Bの提供、回答の保持を制御するZDR設定を公式に案内している。無料・プライバシー設定・応答速度の条件から第一候補。日本語の実際の面接評価の精度は、まだ比較実測していない。
- 対応端末だけのローカルAIはキー不要だが、Androidでのモデル容量・待ち時間・日本語の評価精度が未検証。高速な日常利用の標準にはしない。
- 新しい登録を頼む前に画面統合を完了し、未設定時には無理にログインさせず実戦5問へ案内する。

比較資料（2026-10-12確認）：
https://ai.google.dev/gemini-api/terms
https://help.openai.com/en/articles/9039756-billing-settings-in-chatgpt-vs-platform
https://console.groq.com/docs/models
