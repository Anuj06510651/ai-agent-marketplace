import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';

const steps = [
    { num: 1, label: 'Shop Details' },
    { num: 2, label: 'Automation Setup' },
    { num: 3, label: 'Finish & Payment' },
];

const stepOneRequiredFields = ['shopName', 'ownerName', 'whatsappNumber', 'businessType', 'openingHours'];

export default function SetupWizard() {
    const location = useLocation();

    const selectedAgentName = useMemo(
        () => location.state?.selectedAgentName || 'WhatsApp Bot',
        [location.state?.selectedAgentName]
    );

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        whatsappNumber: '',
        businessType: location.state?.selectedCategory || '',
        businessDescription: '',
        primaryGoal: 'Increase leads and bookings',
        address: '',
        serviceArea: '',
        openingHours: '',
        services: '',
        faq: '',
        leadCaptureFields: 'name,phone,requirement',
        escalationNumber: '',
        bookingLink: '',
        pricingNotes: '',
        unavailableReply: '',
        preferredLanguage: 'English',
        tone: 'Friendly',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatCustomerName, setChatCustomerName] = useState('Rahul');
    const [chatCustomerPhone, setChatCustomerPhone] = useState('+919999999999');
    const [simulating, setSimulating] = useState(false);
    const [chatError, setChatError] = useState('');
    const [chatTranscript, setChatTranscript] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const moveToAutomationStep = () => {
        const missing = stepOneRequiredFields.filter((key) => !formData[key]?.trim());

        if (missing.length > 0) {
            setError('Please complete all required shop details before continuing.');
            return;
        }

        setError('');
        setCurrentStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);
        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(formData),
            });

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Failed to create chatbot setup');
            }

            setResult(payload.data);
            setCurrentStep(3);
            setChatTranscript([]);
        } catch (err) {
            if (err?.name === 'TypeError' || /Failed to fetch/i.test(err?.message || '')) {
                setError('Cannot reach the backend API. Please run `npm run dev` and ensure MongoDB is running.');
            } else {
                setError(err.message || 'Unable to complete setup.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateChat = async (e) => {
        e.preventDefault();
        setChatError('');

        if (!result?.id) {
            setChatError('Please complete setup first to test chatbot responses.');
            return;
        }

        if (!chatQuestion.trim()) {
            setChatError('Enter a customer question to simulate chat.');
            return;
        }

        setSimulating(true);
        try {
            const response = await fetch(`/api/chatbots/${result.id}/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    customerPhone: chatCustomerPhone,
                    customerName: chatCustomerName,
                    question: chatQuestion,
                }),
            });

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Failed to simulate chatbot reply');
            }

            const botData = payload.data;
            setChatTranscript((prev) => [
                ...prev,
                {
                    question: chatQuestion,
                    reply: botData.reply,
                    intent: botData.intent,
                    confidence: botData.confidence,
                },
            ]);
            setChatQuestion('');
        } catch (err) {
            if (err?.name === 'TypeError' || /Failed to fetch/i.test(err?.message || '')) {
                setChatError('Cannot reach chatbot API. Make sure backend server is running.');
            } else {
                setChatError(err.message || 'Unable to simulate chat right now.');
            }
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            ⚡
                        </div>
                        <span className="text-sm font-bold text-slate-900">AI Agent Marketplace</span>
                    </Link>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Setting up: <span className="text-blue-600 font-semibold">{selectedAgentName}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">WhatsApp Chatbot Setup Wizard</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Give business details once, and your 24x7 receptionist bot is prepared automatically.
                            </p>
                        </div>

                        <div className="flex items-center gap-0 overflow-x-auto pb-1">
                            {steps.map((step, idx) => (
                                <div key={step.num} className="flex items-center shrink-0">
                                    <div
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth
                                        ${currentStep === step.num
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : currentStep > step.num
                                                ? 'bg-blue-100 text-blue-700'
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
                                        <span>{step.label}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 mx-1 ${currentStep > step.num ? 'bg-blue-400' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                            <h3 className="text-sm font-bold text-slate-800">What this setup prepares</h3>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                                <li>Instant welcome + FAQ handling for your WhatsApp customers</li>
                                <li>Lead capture flow (name, phone, requirement)</li>
                                <li>Escalation to owner for complex requests</li>
                                <li>Prototype completion with payment handoff placeholder</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 h-fit">
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900">Step 1: Shop Details</h2>
                                <p className="text-sm text-slate-500">Basic details we need to set up your chatbot identity.</p>

                                <Input label="Shop Name *" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Sharma Sweet House" />
                                <Input label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g. Ravi Sharma" />
                                <Input label="Business WhatsApp Number *" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="e.g. +91 98XXXXXXXX" />
                                <Input label="Business Type *" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g. Grocery, Salon, Bakery" />
                                <Input label="Opening Hours *" name="openingHours" value={formData.openingHours} onChange={handleChange} placeholder="e.g. Mon-Sat, 9 AM - 9 PM" />
                                <Input label="Shop Address" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Main market, Jaipur" />
                                <Input label="Service Area" name="serviceArea" value={formData.serviceArea} onChange={handleChange} placeholder="e.g. 5km around shop" />

                                <button
                                    type="button"
                                    onClick={moveToAutomationStep}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-smooth"
                                >
                                    Continue to Automation Setup
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900">Step 2: Automation Setup</h2>
                                <p className="text-sm text-slate-500">These details help your receptionist bot answer naturally for your business.</p>

                                <Input label="Business Description" name="businessDescription" value={formData.businessDescription} onChange={handleChange} placeholder="What do you sell and to whom?" />

                                <label className="block text-sm font-semibold text-slate-700">
                                    Primary Goal
                                    <select
                                        name="primaryGoal"
                                        value={formData.primaryGoal}
                                        onChange={handleChange}
                                        className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                    >
                                        <option>Increase leads and bookings</option>
                                        <option>Answer FAQs quickly</option>
                                        <option>Automate order enquiries</option>
                                        <option>Increase repeat customers</option>
                                    </select>
                                </label>

                                <Input label="Services (comma separated)" name="services" value={formData.services} onChange={handleChange} placeholder="e.g. Haircut, Facial, Bridal makeup" />
                                <Input label="Common FAQs (comma separated)" name="faq" value={formData.faq} onChange={handleChange} placeholder="e.g. timing, home delivery, payment methods" />
                                <Input label="Lead Capture Fields (comma separated)" name="leadCaptureFields" value={formData.leadCaptureFields} onChange={handleChange} placeholder="e.g. name,phone,requirement" />
                                <Input label="Escalation Phone Number" name="escalationNumber" value={formData.escalationNumber} onChange={handleChange} placeholder="Owner/manager phone for urgent handoff" />
                                <Input label="Booking Link (optional)" name="bookingLink" value={formData.bookingLink} onChange={handleChange} placeholder="Google form / Calendly / website link" />
                                <Input label="Pricing Notes" name="pricingNotes" value={formData.pricingNotes} onChange={handleChange} placeholder="e.g. Starting from ₹499, final quote after discussion" />
                                <Input label="Fallback Reply (optional)" name="unavailableReply" value={formData.unavailableReply} onChange={handleChange} placeholder="If bot is unsure, what should it reply?" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Language
                                        <select
                                            name="preferredLanguage"
                                            value={formData.preferredLanguage}
                                            onChange={handleChange}
                                            className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                        >
                                            <option>English</option>
                                            <option>Hindi</option>
                                            <option>Hinglish</option>
                                        </select>
                                    </label>

                                    <label className="block text-sm font-semibold text-slate-700">
                                        Tone
                                        <select
                                            name="tone"
                                            value={formData.tone}
                                            onChange={handleChange}
                                            className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                        >
                                            <option>Friendly</option>
                                            <option>Professional</option>
                                            <option>Casual</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-smooth"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Preparing chatbot...' : 'Continue'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900">Step 3: Prototype Complete ✅</h2>
                                <p className="text-sm text-slate-500">Your chatbot setup is generated and saved. Payment integration will be plugged in next.</p>

                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 space-y-2">
                                    <p><span className="font-semibold">Receptionist:</span> {result?.receptionistName}</p>
                                    <p><span className="font-semibold">Status:</span> {result?.chatbotStatus} ({result?.paymentStatus} payment)</p>
                                    <p><span className="font-semibold">Welcome message:</span> {result?.welcomeMessage}</p>
                                </div>

                                {result?.quickReplies?.length > 0 && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        <p className="font-semibold mb-2">Generated quick replies</p>
                                        <ul className="space-y-1 list-disc pl-4">
                                            {result.quickReplies.map((reply) => (
                                                <li key={reply.trigger}>
                                                    <span className="font-semibold">{reply.trigger}:</span> {reply.response}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled
                                    className="w-full py-3 bg-indigo-600/60 text-white font-semibold rounded-xl cursor-not-allowed"
                                >
                                    Continue to Payment (Coming Soon)
                                </button>

                                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                                    <h3 className="text-sm font-bold text-slate-800">Try Live Chatbot Simulation</h3>
                                    <p className="text-xs text-slate-500">
                                        Ask customer-style questions to test if the bot behaves like a smart receptionist.
                                    </p>

                                    <form onSubmit={handleSimulateChat} className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Input
                                                label="Customer Name"
                                                name="chatCustomerName"
                                                value={chatCustomerName}
                                                onChange={(e) => setChatCustomerName(e.target.value)}
                                                placeholder="e.g. Priya"
                                            />
                                            <Input
                                                label="Customer Phone"
                                                name="chatCustomerPhone"
                                                value={chatCustomerPhone}
                                                onChange={(e) => setChatCustomerPhone(e.target.value)}
                                                placeholder="e.g. +91..."
                                            />
                                        </div>

                                        <label className="block text-sm font-semibold text-slate-700">
                                            Customer Question
                                            <textarea
                                                value={chatQuestion}
                                                onChange={(e) => setChatQuestion(e.target.value)}
                                                placeholder="e.g. What are your charges for a birthday cake and can I get delivery tomorrow?"
                                                rows={3}
                                                className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={simulating}
                                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {simulating ? 'Thinking...' : 'Ask Chatbot'}
                                        </button>
                                    </form>

                                    {chatError && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                            {chatError}
                                        </div>
                                    )}

                                    {chatTranscript.length > 0 && (
                                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                            {chatTranscript.map((entry, index) => (
                                                <div key={`${entry.question}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                                                    <p className="text-xs text-slate-500"><span className="font-semibold">Customer:</span> {entry.question}</p>
                                                    <p className="text-sm text-slate-700"><span className="font-semibold">Bot:</span> {entry.reply}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        intent: <span className="font-semibold">{entry.intent}</span> • confidence: <span className="font-semibold">{entry.confidence}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/"
                                    className="block w-full py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-smooth"
                                >
                                    Back to Marketplace
                                </Link>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function Input({ label, name, value, onChange, placeholder }) {
    return (
        <label className="block text-sm font-semibold text-slate-700">
            {label}
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
            />
        </label>
    );
}
