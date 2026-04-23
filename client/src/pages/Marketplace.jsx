import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agents, categories } from '../data/dummyData';

export default function Marketplace() {
    const [activeCategory, setActiveCategory] = useState('all');
    const navigate = useNavigate();

    const openWhatsAppSetup = (agent) => {
        navigate('/setup', {
            state: {
                selectedAgentName: agent?.name || 'WhatsApp Bot',
                selectedCategory: agent?.category || 'WhatsApp Automation',
                source: 'marketplace',
            },
        });
    };

    const filtered = activeCategory === 'all'
        ? agents
        : agents.filter(a => a.category === activeCategory);

    return (
        <div className="p-6 space-y-6">
            {/* ── Hero Banner ─────────────────────────────── */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 md:py-14">
                {/* Decorative circles */}
                <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -right-8 bottom-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />
                <div className="absolute right-12 top-8 w-32 h-32 border border-white/5 rounded-full" />
                <div className="absolute right-20 top-16 w-20 h-20 border border-white/10 rounded-full" />

                <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                        Marketplace Spotlight
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                        Scale your local shop with AI automation.
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
                        Deploy pre-built agents designed for non-technical business owners.
                        Start capturing leads and booking calls 24/7.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => openWhatsAppSetup()}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-smooth"
                        >
                            Setup WhatsApp Receptionist
                        </button>
                        <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/10 transition-smooth backdrop-blur-sm">
                            View Case Studies
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Category Filter ─────────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-smooth
              ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── Agent Card Grid ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onWhatsAppSetup={openWhatsAppSetup} />
                ))}
            </div>
        </div>
    );
}

function AgentCard({ agent, onWhatsAppSetup }) {
    const [hovered, setHovered] = useState(false);
    const isWhatsAppBot = agent.category === 'WhatsApp Automation' || agent.name.toLowerCase().includes('whatsapp');
    const isWebConcierge = agent.name.toLowerCase().includes('web concierge');
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (isWebConcierge) {
            navigate('/web-concierge', {
                state: {
                    source: 'marketplace-card',
                    agentName: agent.name,
                },
            });
            return;
        }

        if (isWhatsAppBot) {
            onWhatsAppSetup(agent);
        }
    };

    const handleInstallClick = (e) => {
        e.stopPropagation();
        if (isWebConcierge) {
            navigate('/web-concierge', {
                state: {
                    source: 'marketplace-card',
                    agentName: agent.name,
                },
            });
            return;
        }

        if (isWhatsAppBot) {
            onWhatsAppSetup(agent);
        }
    };

    return (
        <div
            className="agent-card bg-white rounded-xl border border-slate-200 overflow-hidden transition-smooth cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleCardClick}
        >
            {/* Icon Area */}
            <div className={`relative h-36 ${agent.iconBg} flex items-center justify-center`}>
                {/* Badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md ${agent.badgeColor}`}>
                    {agent.badge}
                </span>
                <span className="text-5xl filter drop-shadow-lg">{agent.icon}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title + Rating */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-slate-700">{agent.rating}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {agent.description}
                </p>

                {/* Tag + Installs */}
                <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-600 uppercase tracking-wide">{agent.tag}</span>
                    <span className="text-slate-400">{agent.installs} Installs</span>
                </div>

                {/* Install Button */}
                <button
                    onClick={handleInstallClick}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-smooth
            ${hovered
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                >
                    {isWebConcierge
                        ? 'Open Web Concierge'
                        : isWhatsAppBot
                            ? 'Start WhatsApp Setup'
                            : hovered
                                ? '+ Add to Workspace'
                                : 'Install Agent'}
                </button>
            </div>
        </div>
    );
}
