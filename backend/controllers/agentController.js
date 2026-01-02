import Agent from '../models/Agent.js';
import Order from '../models/Order.js';

// @desc    Get all agents with stats
// @route   GET /api/admin/agents
// @access  Private/Admin
export const getAgents = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const agents = await Agent.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get order counts for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const orderCount = await Order.countDocuments({ phoneNumber: agent.phone });
        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          status: agent.status,
          registrationFeePaid: agent.registrationFeePaid,
          wallet: agent.wallet,
          orderCount,
          createdAt: agent.createdAt
        };
      })
    );

    res.json({
      success: true,
      items: agentsWithStats
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

// @desc    Get agent stats
// @route   GET /api/admin/agents/stats
// @access  Private/Admin
export const getAgentStats = async (req, res) => {
  try {
    const [pendingCount, approvedCount, rejectedCount, totalAgents] = await Promise.all([
      Agent.countDocuments({ status: 'pending' }),
      Agent.countDocuments({ status: 'approved' }),
      Agent.countDocuments({ status: 'rejected' }),
      Agent.countDocuments({})
    ]);

    res.json({
      success: true,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalAgents
    });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
};

// @desc    Approve agent
// @route   PUT /api/admin/agents/:id/approve
// @access  Private/Admin
export const approveAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent.status = 'approved';
    await agent.save();

    res.json({
      success: true,
      message: 'Agent approved successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        status: agent.status
      }
    });
  } catch (error) {
    console.error('Approve agent error:', error);
    res.status(500).json({ error: 'Failed to approve agent' });
  }
};

// @desc    Reject agent
// @route   PUT /api/admin/agents/:id/reject
// @access  Private/Admin
export const rejectAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent.status = 'rejected';
    await agent.save();

    res.json({
      success: true,
      message: 'Agent rejected',
      agent: {
        id: agent._id,
        name: agent.name,
        status: agent.status
      }
    });
  } catch (error) {
    console.error('Reject agent error:', error);
    res.status(500).json({ error: 'Failed to reject agent' });
  }
};

// @desc    Delete agent
// @route   DELETE /api/admin/agents/:id
// @access  Private/Admin
export const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Only allow deletion of rejected agents
    if (agent.status !== 'rejected') {
      return res.status(400).json({ error: 'Only rejected agents can be deleted' });
    }

    await agent.deleteOne();

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
};

// @desc    Get agent orders (all agent orders for admin)
// @route   GET /api/admin/agents/orders
// @access  Private/Admin
export const getAgentOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Get all approved agent phone numbers for name lookup
    const approvedAgents = await Agent.find({ status: 'approved' }).select('phone name');
    const phoneToName = {};
    approvedAgents.forEach(a => { phoneToName[a.phone] = a.name; });

    // Filter by packageCode starting with 'agent_' (agent packages)
    const filter = { packageCode: /^agent_/ };
    if (status === 'pending') filter.deliveryStatus = 'pending';
    if (status === 'processing') filter.deliveryStatus = 'processing';
    if (status === 'delivered') filter.deliveryStatus = 'delivered';

    const orders = await Order.find(filter)
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        agentName: phoneToName[order.agentPhone] || 'Unknown',
        agentPhone: order.agentPhone,
        networkName: order.network?.name,
        networkSlug: order.network?.slug,
        packageTitle: order.package?.title,
        packageCode: order.packageCode,
        sizeGb: order.package?.sizeGb,
        phoneNumber: order.phoneNumber, // Recipient phone
        amount: order.amount,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get agent orders error:', error);
    res.status(500).json({ error: 'Failed to fetch agent orders' });
  }
};
