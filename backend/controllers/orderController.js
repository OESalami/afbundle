import Order from '../models/Order.js';
import Package from '../models/Package.js';
import Network from '../models/Network.js';
import crypto from 'crypto';

// Generate unique order ID (shorter format)
const generateOrderId = () => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { packageId, phoneNumber } = req.body;

    if (!packageId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Package ID and phone number are required' 
      });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ 
        error: 'Phone number must be 10 digits' 
      });
    }

    const pkg = await Package.findOne({ packageCode: packageId, active: true });
    if (!pkg) {
      return res.status(404).json({ 
        error: 'Package not found or inactive' 
      });
    }

    const network = await Network.findById(pkg.network);
    if (!network || !network.active) {
      return res.status(404).json({ 
        error: 'Network not found or inactive' 
      });
    }

    const order = await Order.create({
      orderId: generateOrderId(),
      network: network._id,
      package: pkg._id,
      packageCode: pkg.packageCode,
      phoneNumber,
      amount: pkg.price,
      paymentStatus: 'pending',
      deliveryStatus: 'pending'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price');

    res.status(201).json({
      success: true,
      order: {
        id: populatedOrder._id,
        orderId: populatedOrder.orderId,
        networkName: populatedOrder.network.name,
        networkSlug: populatedOrder.network.slug,
        packageTitle: populatedOrder.package.title,
        sizeGb: populatedOrder.package.sizeGb,
        phoneNumber: populatedOrder.phoneNumber,
        amount: populatedOrder.amount,
        paymentStatus: populatedOrder.paymentStatus,
        deliveryStatus: populatedOrder.deliveryStatus,
        createdAt: populatedOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// @desc    Get all orders (admin) - Customer orders only
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, deliveryStatus } = req.query;
    
    // Filter for customer orders only (packageCode NOT starting with 'agent_')
    const filter = { packageCode: { $not: /^agent_/ } };
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
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
        networkName: order.network?.name,
        networkSlug: order.network?.slug,
        packageTitle: order.package?.title,
        packageCode: order.packageCode,
        sizeGb: order.package?.sizeGb,
        phoneNumber: order.phoneNumber,
        amount: order.amount,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        paystackReference: order.paystackReference,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// @desc    Get orders by phone number (for customer)
// @route   GET /api/orders/phone/:phoneNumber
// @access  Public
export const getOrdersByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const orders = await Order.find({ phoneNumber })
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        networkName: order.network?.name,
        sizeGb: order.package?.sizeGb,
        phoneNumber: order.phoneNumber,
        amount: order.amount,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get orders by phone error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// @desc    Get orders placed by an agent
// @route   GET /api/orders/agent/:agentPhone
// @access  Public
export const getOrdersByAgent = async (req, res) => {
  try {
    const { agentPhone } = req.params;

    if (!/^\d{10}$/.test(agentPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const orders = await Order.find({ agentPhone })
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        networkName: order.network?.name,
        sizeGb: order.package?.sizeGb,
        phoneNumber: order.phoneNumber,
        agentPhone: order.agentPhone,
        amount: order.amount,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get orders by agent error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let order = await Order.findOne({ orderId: id })
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price');
    
    if (!order) {
      order = await Order.findById(id)
        .populate('network', 'name slug')
        .populate('package', 'title sizeGb price');
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        orderId: order.orderId,
        networkName: order.network?.name,
        networkSlug: order.network?.slug,
        packageTitle: order.package?.title,
        packageCode: order.packageCode,
        sizeGb: order.package?.sizeGb,
        phoneNumber: order.phoneNumber,
        amount: order.amount,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        paystackReference: order.paystackReference,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// @desc    Update order (admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, deliveryStatus, paystackReference } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (paystackReference) order.paystackReference = paystackReference;

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('network', 'name slug')
      .populate('package', 'title sizeGb price');

    res.json({
      success: true,
      item: {
        id: updatedOrder._id,
        orderId: updatedOrder.orderId,
        networkName: updatedOrder.network?.name,
        packageTitle: updatedOrder.package?.title,
        packageCode: updatedOrder.packageCode,
        phoneNumber: updatedOrder.phoneNumber,
        amount: updatedOrder.amount,
        paymentStatus: updatedOrder.paymentStatus,
        deliveryStatus: updatedOrder.deliveryStatus,
        paystackReference: updatedOrder.paystackReference,
        updatedAt: updatedOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.deleteOne();

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};