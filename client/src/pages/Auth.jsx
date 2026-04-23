import { useState } from 'react';
import { saveAuthSession } from '../utils/auth';
import { buildApiUrl } from '../utils/api';

const initialSignupState = {
  name: '',
  email: '',
  password: '',
};

const initialLoginState = {
  email: '',
  password: '',
};

const initialForgotState = {
  email: '',
};

const initialResetState = {
  token: '',
  newPassword: '',
  confirmPassword: '',
};

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [signupForm, setSignupForm] = useState(initialSignupState);
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [forgotForm, setForgotForm] = useState(initialForgotState);
  const [resetForm, setResetForm] = useState(initialResetState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setInfo('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Signup failed.');
      }

      saveAuthSession(payload.data.token, payload.data.user);
      onAuthSuccess?.(payload.data.user);
    } catch (err) {
      setError(err.message || 'Unable to create account right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Login failed.');
      }

      saveAuthSession(payload.data.token, payload.data.user);
      onAuthSuccess?.(payload.data.user);
    } catch (err) {
      setError(err.message || 'Unable to login right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to process forgot password request.');
      }

      if (payload.data?.resetToken) {
        setResetForm((prev) => ({ ...prev, token: payload.data.resetToken }));
        setInfo('Reset token generated. It is auto-filled below. Set your new password now.');
      } else {
        setInfo('If your email exists, password reset instructions were generated.');
      }

      setMode('reset');
    } catch (err) {
      setError(err.message || 'Unable to process forgot password request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetForm.token,
          newPassword: resetForm.newPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to reset password.');
      }

      setInfo(payload.message || 'Password reset successful. Please login.');
      setResetForm(initialResetState);
      setLoginForm((prev) => ({ ...prev, password: '' }));
      setMode('login');
    } catch (err) {
      setError(err.message || 'Unable to reset password right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in or create an account to manage your WhatsApp automation.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-md text-sm font-semibold transition-smooth ${
              isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-md text-sm font-semibold transition-smooth ${
              isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sign up
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-smooth"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </button>
          </form>
        ) : isSignup ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <Field
              label="Name"
              type="text"
              value={signupForm.name}
              onChange={(value) => setSignupForm((prev) => ({ ...prev, name: value }))}
              placeholder="Your name"
            />
            <Field
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(value) => setSignupForm((prev) => ({ ...prev, email: value }))}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={signupForm.password}
              onChange={(value) => setSignupForm((prev) => ({ ...prev, password: value }))}
              placeholder="At least 6 characters"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-semibold rounded-xl transition-smooth"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        ) : isForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter your registered email and we will generate a password reset token.
            </p>

            <Field
              label="Email"
              type="email"
              value={forgotForm.email}
              onChange={(value) => setForgotForm({ email: value })}
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-smooth"
            >
              {loading ? 'Generating token...' : 'Generate reset token'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('reset')}
              className="w-full text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Already have token? Reset password
            </button>
          </form>
        ) : isReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-slate-600">
              Paste your reset token and choose a new password.
            </p>

            <Field
              label="Reset Token"
              type="text"
              value={resetForm.token}
              onChange={(value) => setResetForm((prev) => ({ ...prev, token: value }))}
              placeholder="Paste reset token"
            />

            <Field
              label="New Password"
              type="password"
              value={resetForm.newPassword}
              onChange={(value) => setResetForm((prev) => ({ ...prev, newPassword: value }))}
              placeholder="At least 6 characters"
            />

            <Field
              label="Confirm Password"
              type="password"
              value={resetForm.confirmPassword}
              onChange={(value) => setResetForm((prev) => ({ ...prev, confirmPassword: value }))}
              placeholder="Re-enter new password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-smooth"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Back to login
            </button>
          </form>
        ) : null}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {info}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
      />
    </label>
  );
}