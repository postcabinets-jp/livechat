# LiveChat

**Open-source live chat & shared inbox — self-hosted alternative to Intercom and Crisp.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/livechat&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20credentials&project-name=livechat&repository-name=livechat)

Intercomの94%コスト削減。Supabase + Next.js製のOSSで5分導入。

## Features

- **リアルタイム共有インボックス** — チーム全体で会話管理。未対応/対応中/解決済みのステータス + エージェントアサイン
- **AI自動返信（Claude Haiku）** — オフライン時・高負荷時に自動応答。従量課金なし
- **エージェント稼働レポート** — online/idle/busy/offline の4状態 + 時間記録
- **埋め込みウィジェット** — `<script>` 1行で設置。20KB以下
- **コンタクトCRM** — 訪問者識別、会話履歴、カスタム属性
- **ナレッジベース** — Markdown記事・カテゴリ管理・公開/非公開切り替え
- **缶詰回答（ショートカット）** — `/` キーでチーム共有の定型文を呼び出し
- **マルチインボックス** — 複数サイト・複数プロダクトを1テナントで管理
- **RLS完全対応** — Supabase Row Level Securityで組織間データ完全分離

## Quick Start

### 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. SQL Editorで `supabase/migrations/001_initial_schema.sql` を実行
3. (オプション) `supabase/seed.sql` でデモデータ投入

### 2. Vercel にデプロイ

上のボタンをクリックして環境変数を設定するだけ。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. ウィジェットを設置

```html
<script src="https://your-app.vercel.app/widget.js" data-site-id="YOUR_INBOX_ID"></script>
```

## Local Development

```bash
git clone https://github.com/postcabinets-jp/livechat
cd livechat
npm install
cp .env.example .env.local
# .env.local を編集してSupabase認証情報を設定
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Database / Auth / Realtime | Supabase (PostgreSQL + WebSocket + RLS) |
| Styling | Tailwind CSS v4 + shadcn/ui (base-ui) |
| AI | Anthropic claude-haiku-4-5 |
| Email | Resend |
| Deploy | Vercel (Edge Runtime) |

## Pricing Comparison

| Plan | Intercom (10 seats) | Crisp | LiveChat OSS |
|------|--------------------:|------:|-------------:|
| Monthly | $1,320+ | $95 | $0–$79 |
| AI replies | $0.99/resolution | Add-on | Unlimited (fixed) |
| Agent reports | Limited | Poor | Full |
| Self-host | No | No | Vercel 1-click |

## Database Schema

10 tables with full RLS:
- `organizations` — マルチテナント
- `agents` — エージェント（role: owner/admin/agent）
- `inboxes` — チャネル（web_widget/email/whatsapp）
- `contacts` — 顧客CRM
- `conversations` — 会話セッション
- `messages` — メッセージ（送受信・内部メモ）
- `canned_responses` — 定型文
- `kb_categories` / `kb_articles` — ナレッジベース
- `labels` — タグ
- `agent_status_log` — 稼働記録

## License

MIT

---

Built by [POST CABINETS](https://postcabinets.co.jp) · [GitHub](https://github.com/postcabinets-jp/livechat)
