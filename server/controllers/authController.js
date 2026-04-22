import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { createAuthToken } from '../middleware/authMiddleware.js';

const resetTokenTtlMinutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || 15);

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: hashResetToken(token),
  };
}

export async function signup(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' });
    }

    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim()?.toLowerCase();
    const password = req.body?.password || '';

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = createAuthToken({ sub: user._id.toString(), email: user.email });

    return res.status(201).json({
      success: true,
      message: 'Signup successful.',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error('signup error', error);
    return res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
}

export async function login(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' });
    }

    const email = req.body?.email?.trim()?.toLowerCase();
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createAuthToken({ sub: user._id.toString(), email: user.email });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ success: false, message: 'Failed to login.' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' });
    }

    const user = await User.findById(req.auth?.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
}

export async function forgotPassword(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' });
    }

    const email = req.body?.email?.trim()?.toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email is registered, password reset steps have been generated.',
      });
    }

    const { token, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + resetTokenTtlMinutes * 60 * 1000);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    console.log(
      `[PasswordReset] Email: ${user.email} | token: ${token} | expiresAt: ${expiresAt.toISOString()}`
    );

    return res.json({
      success: true,
      message: 'Password reset token generated. Use it to set a new password.',
      data: {
        resetToken: token,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('forgotPassword error', error);
    return res.status(500).json({ success: false, message: 'Failed to start password reset.' });
  }
}

export async function resetPassword(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' });
    }

    const token = req.body?.token?.trim();
    const newPassword = req.body?.newPassword || '';

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const tokenHash = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    console.error('resetPassword error', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}