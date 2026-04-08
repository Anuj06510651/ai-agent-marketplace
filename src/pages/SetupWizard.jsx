import { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
    { num: 1, label: 'Watch Video' },
    { num: 2, label: 'Link Account' },
    { num: 3, label: 'Go Live' },
];

export default function SetupWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        phone: '',
        secretKey: '',
        displayName: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Top Nav (self-contained for wizard) ──── */}
            <header className="bg-white border-b border-slate-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            ⚡
                        </div>
                        <span className="text-sm font-bold text-slate-900">AI Agent Marketplace</span>
                    </Link>

                    {/* Center links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {['Explore', 'My Agents', 'Support'].map((item) => (
                            <button key={item} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-smooth">
                                {item}
                            </button>
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-smooth">
                            Help Center
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-300" />
                    </div>
                </div>
            </header>

            {/* ── Main Content ────────────────────────────── */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* ── Left Column ──────────────────────────── */}
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Setup Wizard</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Follow these 3 simple steps to launch your AI Agent.
                            </p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-0">
                            {steps.map((step, idx) => (
                                <div key={step.num} className="flex items-center">
                                    <button
                                        onClick={() => setCurrentStep(step.num)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth
                      ${currentStep === step.num
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : currentStep > step.num
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}
                                    >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${currentStep === step.num
                                                ? 'bg-white text-blue-600'
                                                : currentStep > step.num
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-300 text-white'
                                            }`}
                                        >
                                            {currentStep > step.num ? '✓' : step.num}
                                        </span>
                                        <span className="hidden sm:inline">{step.label}</span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 mx-1 ${currentStep > step.num ? 'bg-blue-400' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Video Player Mock */}
                        <div className="rounded-xl overflow-hidden bg-slate-900 relative group">
                            <div className="aspect-video bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center relative">
                                {/* Fake thumbnail background */}
                                <div className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%)'
                                    }}
                                />
                                {/* Play button */}
                                <button className="relative z-10 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-smooth group-hover:scale-110">
                                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>

                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                                    <div className="flex items-center gap-2">
                                        {/* Timeline */}
                                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-[30%] bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-white/70">
                                        <span>0:42</span>
                                        <div className="flex items-center gap-2">
                                            <button className="hover:text-white">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                                </svg>
                                            </button>
                                            <button className="hover:text-white">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                                </svg>
                                            </button>
                                            <span>2:23</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info bar below video */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 text-xs">
                                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <span>Watch this 2-minute guide to get your Secret Key from WhatsApp.</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Form ───────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 h-fit">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Connect your WhatsApp</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Fill in your details from the tutorial video to link your business account.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Phone */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Business WhatsApp Number</label>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                    </button>
                                </div>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 555-012-3456"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                    />
                                </div>
                            </div>

                            {/* Secret Key */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Paste your Secret Key</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-500 px-2 py-0.5 rounded">Required</span>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <input
                                        type="password"
                                        name="secretKey"
                                        value={formData.secretKey}
                                        onChange={handleChange}
                                        placeholder="sk_live_..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                    />
                                </div>
                                <p className="text-xs text-blue-500 mt-1.5 italic">
                                    This key is encrypted and never shared with anyone.
                                </p>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name for AI</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="e.g. Sunny's Bakery Assistant"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-smooth flex items-center justify-center gap-2">
                            Continue to Step 2
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>

                        <button className="w-full text-sm text-slate-500 hover:text-blue-600 font-medium text-center transition-smooth">
                            Save as Draft & Finish Later
                        </button>

                        {/* Help Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Stuck? We're here to help!</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Click the chat bubble in the bottom right to talk to a human expert who can set this up for you for free.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
