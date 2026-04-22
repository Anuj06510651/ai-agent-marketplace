import mongoose from 'mongoose';
import CustomerProfile from '../models/CustomerProfile.js';

export async function getCustomers(_req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected.',
      });
    }

    const records = await CustomerProfile.find().sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('getCustomers error', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details.',
    });
  }
}

export async function getCustomerById(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected.',
      });
    }

    const record = await CustomerProfile.findById(req.params.id).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Customer record not found.',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer record.',
    });
  }
}