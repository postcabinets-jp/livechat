import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="font-semibold text-gray-900">LiveChat</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/postcabinets-jp/livechat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 hidden sm:block"
            >
              GitHub
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-sm">
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-sm">
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          Intercom / Crisp のOSS代替
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          チームの<span className="text-blue-600">ライブチャット</span>を
          <br />
          定額・自己ホスティングで
        </h1>
        <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Intercomの94%コスト削減。Supabase + Next.js製のOSSで、
          <br className="hidden sm:block" />
          5分でサイトにチャットを設置。エージェント管理・AI自動返信・レポートまで完備。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 text-base">
              無料で始める
            </Button>
          </Link>
          <a
            href="https://github.com/postcabinets-jp/livechat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="h-11 px-6 text-base gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub で見る
            </Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          クレジットカード不要 · セットアップ5分 · 完全無料で開始
        </p>
      </section>

      {/* Demo inbox mockup */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <div className="flex h-10 items-center gap-1.5 px-4 bg-gray-800 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-gray-400">LiveChat — インボックス</span>
          </div>
          <div className="flex h-64">
            {/* Sidebar */}
            <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col">
              <div className="p-3 text-xs text-gray-400 border-b border-gray-700">インボックス</div>
              {[
                { name: '山田 太郎', msg: 'プランのアップグレード...', badge: 'open' },
                { name: '渡辺 雪', msg: 'エンタープライズ契約...', badge: 'open' },
                { name: '鈴木 花子', msg: 'APIキーの取得方法', badge: 'pending' },
              ].map((c) => (
                <div key={c.name} className={`p-3 border-b border-gray-700 cursor-pointer ${c.name === '山田 太郎' ? 'bg-gray-700' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium">{c.name}</span>
                    <span className={`text-xs px-1 rounded ${c.badge === 'open' ? 'bg-blue-900 text-blue-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {c.badge === 'open' ? '対応中' : '未対応'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{c.msg}</p>
                </div>
              ))}
            </div>
            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex-shrink-0" />
                  <div className="bg-gray-700 text-white text-xs p-2.5 rounded-lg max-w-xs">
                    プランのアップグレードを検討しています。データは引き継がれますか？
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0" />
                  <div className="bg-blue-600 text-white text-xs p-2.5 rounded-lg max-w-xs">
                    ご安心ください。データは完全に保持されます。Proプランは月間会話数が無制限です。
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-700 p-3">
                <div className="bg-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400">
                  メッセージを入力...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Intercom比 <span className="text-blue-600">94%</span> コスト削減
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b-2 border-gray-900 text-gray-900 font-semibold">機能</th>
                <th className="p-4 border-b-2 border-gray-200 text-gray-400">Intercom</th>
                <th className="p-4 border-b-2 border-gray-200 text-gray-400">Crisp</th>
                <th className="p-4 border-b-2 border-blue-600 text-blue-600 font-semibold">LiveChat OSS</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["月額（10名）", "$1,320+", "$95", "$0〜$79"],
                ["AI自動返信", "$0.99/回", "有料オプション", "無制限（固定費）"],
                ["エージェント稼働レポート", "限定的", "貧弱", "完全搭載"],
                ["セルフホスト", "不可", "不可", "Vercel 1クリック"],
                ["ソースコード", "非公開", "非公開", "MIT ライセンス"],
              ].map(([feat, intercom, crisp, ours]) => (
                <tr key={feat} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-700 font-medium">{feat}</td>
                  <td className="p-4 text-center text-gray-400">{intercom}</td>
                  <td className="p-4 text-center text-gray-400">{crisp}</td>
                  <td className="p-4 text-center text-blue-700 font-medium">{ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            必要な機能がすべて揃っている
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "リアルタイム共有インボックス",
                desc: "チーム全体で会話を管理。未対応/対応中/解決済みのステータス管理、エージェントへのアサインが可能。",
              },
              {
                title: "AI自動返信（Claude Haiku）",
                desc: "オフライン時や高負荷時にAIが自動応答。ナレッジベースを参照したRAG回答。月額固定内で従量課金なし。",
              },
              {
                title: "エージェント稼働レポート",
                desc: "online/idle/busy/offlineの4状態と時間記録。エージェントごとの担当会話数・解決数を完全可視化。",
              },
              {
                title: "埋め込みウィジェット",
                desc: "script 1行でサイトに設置。カラー・ウェルカムメッセージをダッシュボードからカスタマイズ。20KB以下。",
              },
              {
                title: "コンタクトCRM",
                desc: "訪問者の識別（メール・名前・カスタム属性）、会話履歴の一覧。プラン・会社情報も記録可能。",
              },
              {
                title: "ナレッジベース",
                desc: "Markdown記事のCRUD・カテゴリ分類・公開/非公開切り替え。チャット内からの自動サジェスト対応。",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 rounded-sm" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          シンプルな料金体系
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          席数ではなくチーム単位で課金。人数が増えても追加費用なし。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {plan: "Free", price: "$0", seats: "2名", conv: "100件/月", ai: "なし", highlight: false},
            {plan: "Starter", price: "$29", seats: "5名", conv: "1,000件/月", ai: "100回/月", highlight: false},
            {plan: "Pro", price: "$79", seats: "15名", conv: "無制限", ai: "無制限", highlight: true},
            {plan: "Business", price: "$199", seats: "無制限", conv: "無制限", ai: "無制限 + SLA", highlight: false},
          ].map((tier) => (
            <div
              key={tier.plan}
              className={`rounded-2xl border p-6 ${
                tier.highlight
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              {tier.highlight && (
                <p className="text-xs font-medium text-blue-600 mb-2">最も人気</p>
              )}
              <p className="font-semibold text-gray-900">{tier.plan}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {tier.price}
                <span className="text-sm font-normal text-gray-400">/月</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>{tier.seats}まで</li>
                <li>会話 {tier.conv}</li>
                <li>AI返信 {tier.ai}</li>
              </ul>
              <Link href="/register" className="block mt-6">
                <Button
                  className={`w-full text-sm ${tier.highlight ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  variant={tier.highlight ? "default" : "outline"}
                >
                  始める
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Self-host CTA */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">自分でホスティングする</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            MITライセンス。Vercelボタン1クリックでデプロイ完了。
            <br />
            Supabaseの無料プランで月間アクティブユーザー50,000名まで対応。
          </p>
          <a
            href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/livechat&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20credentials&project-name=livechat&repository-name=livechat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://vercel.com/button" alt="Deploy with Vercel" className="h-10" />
          </a>
          <p className="text-gray-500 text-xs mt-4">
            デプロイ後、Supabaseの認証URLを設定するだけで稼働します
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-sm text-gray-600">LiveChat</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400">MIT License</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a
              href="https://github.com/postcabinets-jp/livechat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              GitHub
            </a>
            <a href="/help" className="hover:text-gray-600">
              ドキュメント
            </a>
            <a
              href="https://postcabinets.co.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              POST CABINETS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
