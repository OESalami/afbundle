import Admin from '../models/Admin.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), active: true });
    
    if (!admin || !admin.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ 
      id: admin._id, 
      email: admin.email,
      name: admin.name 
    });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// @desc    Get current admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};