import Agent from '../models/Agent.js';
import { generateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const REGISTRATION_FEE = parseInt(process.env.AGENT_REGISTRATION_FEE) || 50; // GH₵
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'afdbundles.com';

// Verify Paystack transaction
const verifyPaystackTransaction = async (reference) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { status: false, message: error.message };
  }
};

// @desc    Register agent (with payment verification)
// @route   POST /api/agent/auth/register
// @access  Public
export const registerAgent = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, paymentReference } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!paymentReference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if agent exists
    const existingEmail = await Agent.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingPhone = await Agent.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Check if payment reference already used
    const existingPayment = await Agent.findOne({ paymentReference });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment reference already used' });
    }

    // Verify payment with Paystack
    console.log(`[AGENT REGISTRATION] Verifying payment: ${paymentReference}`);
    const paystackResponse = await verifyPaystackTransaction(paymentReference);

    if (!paystackResponse.status || paystackResponse.data?.status !== 'success') {
      console.log(`[AGENT REGISTRATION] Payment verification failed for ${phone}`);
      return res.status(400).json({ 
        error: 'Payment verification failed',
        details: paystackResponse.message || 'Transaction not successful'
      });
    }

    // Verify amount (Paystack returns in pesewas)
    const paidAmount = paystackResponse.data.amount / 100;
    if (paidAmount < REGISTRATION_FEE) {
      console.log(`[AGENT REGISTRATION] Insufficient payment: GH₵${paidAmount} < GH₵${REGISTRATION_FEE}`);
      return res.status(400).json({ 
        error: 'Insufficient payment amount',
        details: `Paid: GH₵${paidAmount}, Required: GH₵${REGISTRATION_FEE}`
      });
    }

    console.log(`[AGENT REGISTRATION] Payment verified: GH₵${paidAmount} for ${phone}`);

    // Create agent with payment info
    const agent = await Agent.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      registrationFeePaid: true,
      registrationFee: REGISTRATION_FEE,
      paymentReference
    });

    console.log(`[AGENT REGISTRATION] Agent created: ${agent.name} (${agent.phone})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone
      }
    });
  } catch (error) {
    console.error('Register agent error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// @desc    Login agent
// @route   POST /api/agent/auth/login
// @access  Public
export const loginAgent = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Phone/Email and password required' });
    }

    // Find by email or phone
    const agent = await Agent.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ],
      active: true
    });

    if (!agent || !agent.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: agent._id,
      email: agent.email,
      phone: agent.phone,
      name: agent.name,
      type: 'agent'
    });

    res.json({
      success: true,
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        status: agent.status,
        wallet: agent.wallet,
        registrationFeePaid: agent.registrationFeePaid
      }
    });
  } catch (error) {
    console.error('Login agent error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// @desc    Get current agent
// @route   GET /api/agent/auth/me
// @access  Private
export const getAgentMe = async (req, res) => {
  try {
    const agent = await Agent.findById(req.agent.id).select('-password');

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        status: agent.status,
        wallet: agent.wallet,
        registrationFeePaid: agent.registrationFeePaid
      }
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
};
