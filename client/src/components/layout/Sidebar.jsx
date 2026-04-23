import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', icon: DashboardIcon, label: 'Dashboard' },
    { to: '/', icon: MarketplaceIcon, label: 'Marketplace' },
    { to: '/setup', icon: MyAgentsIcon, label: 'My Agents' },
    { to: '/analytics', icon: AnalyticsIcon, label: 'Analytics' },
];

const supportItems = [
    { icon: DocIcon, label: 'Documentation' },
    { icon: SettingsIcon, label: 'Settings' },
];

export default function Sidebar() {
    const collapsed = false;

    return (
        <>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 z-40 pointer-events-none" />

            <aside className={`fixed top-0 left-0 z-50 h-screen bg-sidebar-bg text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'} hidden lg:flex`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                        ⚡
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <h1 className="text-sm font-bold tracking-wide truncate">LocalAI Nexus</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Vendor Portal</p>
                        </div>
                    )}
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth
                ${isActive && item.label === 'Marketplace' ? 'bg-sidebar-active text-white' : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'}`
                            }
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}

                    {/* Support section */}
                    {!collapsed && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-6 mb-2 px-3">
                            Support
                        </p>
                    )}
                    {supportItems.map((item) => (
                        <button
                            key={item.label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-sidebar-hover hover:text-white transition-smooth w-full text-left"
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Bottom: Plan + User */}
                <div className="border-t border-white/10 p-4 space-y-3">
                    {!collapsed && (
                        <>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Current Plan</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-semibold">Starter Business</span>
                                    <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded font-bold">PRO</span>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-smooth">
                                Upgrade Nexus
                            </button>
                        </>
                    )}

                    {/* User */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                            RB
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">Riverside Bakery</p>
                                <p className="text-[11px] text-slate-400">Admin Access</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button className="text-slate-400 hover:text-white">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

// ─── Icon Components ─────────────────────────────────────
function DashboardIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
        </svg>
    );
}

function MarketplaceIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
}

function MyAgentsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    );
}

function AnalyticsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function DocIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function SettingsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
