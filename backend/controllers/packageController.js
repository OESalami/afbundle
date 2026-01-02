import Package from '../models/Package.js';
import Network from '../models/Network.js';

// @desc    Get packages (optionally filtered by network)
// @route   GET /api/packages
// @access  Public
export const getPackages = async (req, res) => {
  try {
    const { networkId, type } = req.query;
    
    const filter = {};
    if (networkId) {
      filter.networkSlug = networkId;
    }
    if (type) {
      filter.type = type;
    }

    const packages = await Package.find(filter)
      .populate('network', 'name slug')
      .sort({ sizeGb: 1 });

    res.json({
      success: true,
      items: packages.map(pkg => ({
        _id: pkg._id,
        packageCode: pkg.packageCode,
        networkId: pkg.networkSlug,
        networkName: pkg.network?.name,
        type: pkg.type,
        sizeGb: pkg.sizeGb,
        title: pkg.title,
        price: pkg.price,
        validity: pkg.validity,
        active: pkg.active
      }))
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('network', 'name slug');

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({
      success: true,
      item: {
        _id: pkg._id,
        packageCode: pkg.packageCode,
        networkId: pkg.networkSlug,
        networkName: pkg.network?.name,
        sizeGb: pkg.sizeGb,
        title: pkg.title,
        price: pkg.price,
        validity: pkg.validity,
        active: pkg.active
      }
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
};

// @desc    Create package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = async (req, res) => {
  try {
    const { networkId, sizeGb, price, validity, type } = req.body;
    const packageType = type || 'customer';

    if (!networkId || !sizeGb || price === undefined) {
      return res.status(400).json({ error: 'Network, size, and price are required' });
    }

    // Find network
    const network = await Network.findOne({ slug: networkId });
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }

    // Generate unique packageCode based on type
    const packageCode = packageType === 'agent' 
      ? `agent_${networkId}_${sizeGb}` 
      : `customer_${networkId}_${sizeGb}`;
    
    // Check if package already exists for this network, size, and type
    const existing = await Package.findOne({ 
      networkSlug: networkId, 
      sizeGb: Number(sizeGb), 
      type: packageType 
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: `${packageType === 'agent' ? 'Agent' : 'Customer'} package with ${sizeGb}GB already exists for ${network.name}` 
      });
    }

    const pkg = await Package.create({
      packageCode,
      network: network._id,
      networkSlug: networkId,
      type: packageType,
      title: `${sizeGb}GB Data`,
      sizeGb: Number(sizeGb),
      price: Number(price),
      validity: validity || '30 days',
      active: true
    });

    res.status(201).json({
      success: true,
      item: {
        _id: pkg._id,
        packageCode: pkg.packageCode,
        networkId: pkg.networkSlug,
        networkName: network.name,
        type: pkg.type,
        sizeGb: pkg.sizeGb,
        title: pkg.title,
        price: pkg.price,
        validity: pkg.validity,
        active: pkg.active
      }
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res) => {
  try {
    const { price, active, validity } = req.body;

    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Update allowed fields
    if (price !== undefined) pkg.price = Number(price);
    if (active !== undefined) pkg.active = active;
    if (validity !== undefined) pkg.validity = validity;

    await pkg.save();

    const updated = await Package.findById(pkg._id).populate('network', 'name slug');

    res.json({
      success: true,
      item: {
        _id: updated._id,
        packageCode: updated.packageCode,
        networkId: updated.networkSlug,
        networkName: updated.network?.name,
        sizeGb: updated.sizeGb,
        title: updated.title,
        price: updated.price,
        validity: updated.validity,
        active: updated.active
      }
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Failed to update package' });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await pkg.deleteOne();

    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
};

// @desc    Get prices map for a network (for customer/agent page)
// @route   GET /api/packages/prices/:networkId
// @access  Public
export const getNetworkPrices = async (req, res) => {
  try {
    const { networkId } = req.params;
    const { type } = req.query;
    const packageType = type || 'customer';

    const packages = await Package.find({ 
      networkSlug: networkId,
      type: packageType,
      active: true 
    }).select('sizeGb price packageCode');

    // Create a map of sizeGb -> { price, packageCode }
    const priceMap = {};
    packages.forEach(pkg => {
      priceMap[pkg.sizeGb] = {
        price: pkg.price,
        packageCode: pkg.packageCode
      };
    });

    res.json({
      success: true,
      networkId,
      prices: priceMap
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
};