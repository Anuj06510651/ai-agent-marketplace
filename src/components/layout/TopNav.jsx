import { NavLink } from 'react-router-dom';

export default function TopNav() {
    return (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Title */}
                <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">
                    AI Agent<br className="sm:hidden" /> Marketplace
                </h2>

                {/* Center: Search + Tabs */}
                <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
                    {/* Search */}
                    <div className="relative max-w-sm w-full">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search agents (e.g. 'Dental support')"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                        />
                    </div>

                    {/* Tabs */}
                    <nav className="flex items-center gap-1">
                        {['Explore', 'Featured', 'New Releases'].map((tab, i) => (
                            <button
                                key={tab}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-smooth
                  ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: CTA */}
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-smooth shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Build Custom Agent
                </button>
            </div>
        </header>
    );
}
