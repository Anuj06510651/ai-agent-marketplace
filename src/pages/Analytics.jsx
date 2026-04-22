import SparklineChart from '../components/ui/SparklineChart';
import { stats, leads, channels } from '../data/dummyData';

export default function Analytics() {
    return (
        <div className="p-6 space-y-6">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vendor Performance</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time insights from your AI business assistants.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 transition-smooth">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-smooth">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Report
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-smooth">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {stat.label}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.changeColor}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900 mb-3">{stat.value}</p>
                        <SparklineChart data={stat.data} height={50} />
                    </div>
                ))}
            </div>

            {/* ── Bottom Section: Table + Channel Panel ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Leads Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">Recent Leads from AI Agents</h2>
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-smooth">
                            View CRM
                        </button>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50">
                        <div className="col-span-4">Lead Contact</div>
                        <div className="col-span-3">AI Agent Source</div>
                        <div className="col-span-3">Intent Score</div>
                        <div className="col-span-2">Status</div>
                    </div>

                    {/* Table rows */}
                    {leads.map((lead) => (
                        <div key={lead.id} className="grid grid-cols-12 items-center px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-smooth">
                            {/* Contact */}
                            <div className="col-span-4 flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${lead.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                                    {lead.initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{lead.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>
                                </div>
                            </div>

                            {/* Source */}
                            <div className="col-span-3 text-sm text-slate-600">
                                {lead.source}
                            </div>

                            {/* Intent Score */}
                            <div className="col-span-3 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[80px] overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full animate-fill"
                                        style={{ width: `${lead.intent}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{lead.intent}%</span>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${lead.statusColor}`}>
                                    {lead.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Channel Activity Panel */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 h-fit">
                    <h2 className="text-base font-bold text-slate-900">Activity by Channel</h2>

                    <div className="space-y-4">
                        {channels.map((ch) => (
                            <div key={ch.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-slate-700">{ch.name}</span>
                                    <span className="text-xs text-slate-400">{ch.messages} messages</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${ch.color} rounded-full animate-fill`}
                                        style={{ width: `${ch.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 012 2v.58a8 8 0 011.92 1.11l.5-.29a2 2 0 012.74.73l1 1.74a2 2 0 01-.73 2.73l-.5.29a8.06 8.06 0 010 2.22l.5.3a2 2 0 01.73 2.72l-1 1.74a2 2 0 01-2.73.73l-.5-.3A8 8 0 0115 19.43V20a2 2 0 01-2 2h-2a2 2 0 01-2-2v-.58a8 8 0 01-1.92-1.11l-.5.29a2 2 0 01-2.74-.73l-1-1.74a2 2 0 01.73-2.73l.5-.29a8.06 8.06 0 010-2.22l-.5-.3a2 2 0 01-.73-2.72l1-1.74a2 2 0 012.73-.73l.5.3A8 8 0 019 4.57zM12 16a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">AI Suggestion</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                Your WhatsApp agent has a 24% higher conversion rate. Consider increasing its message budget.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Floating Action Buttons ─────────────────── */}
            <div className="fixed right-5 top-1/2 -translate-y-1/2 space-y-2 hidden xl:flex flex-col">
                {[
                    { icon: '💬', label: 'Chat' },
                    { icon: '👥', label: 'Team' },
                    { icon: '⚙️', label: 'Settings' },
                    { icon: '❓', label: 'Help', highlight: true },
                ].map((btn) => (
                    <button
                        key={btn.label}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-md transition-smooth hover:scale-110
              ${btn.highlight
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        title={btn.label}
                    >
                        {btn.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
