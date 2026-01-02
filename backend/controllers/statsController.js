import Order from '../models/Order.js';
import Agent from '../models/Agent.js';

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    // Count orders by delivery status
    const [pendingCount, processingCount, deliveredCount] = await Promise.all([
      Order.countDocuments({ deliveryStatus: 'pending' }),
      Order.countDocuments({ deliveryStatus: 'processing' }),
      Order.countDocuments({ deliveryStatus: 'delivered' })
    ]);

    // Calculate total revenue (paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const wallet = revenueResult[0]?.total || 0;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ 
      createdAt: { $gte: today } 
    });

    // Agent stats
    const [agentPending, agentApproved, agentRejected, totalAgents] = await Promise.all([
      Agent.countDocuments({ status: 'pending' }),
      Agent.countDocuments({ status: 'approved' }),
      Agent.countDocuments({ status: 'rejected' }),
      Agent.countDocuments({})
    ]);

    res.json({
      success: true,
      // Order stats
      pendingCount,
      processingCount,
      deliveredCount,
      totalOrders: pendingCount + processingCount + deliveredCount,
      todayOrders,
      wallet,
      // Agent stats
      agentPending,
      agentApproved,
      agentRejected,
      totalAgents
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};