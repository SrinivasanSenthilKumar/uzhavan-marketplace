const Product = require('../models/Product');

// @desc    Farmer creates/publishes a new product listing
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      nameEn, nameTa, descriptionEn, descriptionTa, category,
      quantity, unit, pricePerUnit, district, village,
      contactName, contactMobile, isOrganic, harvestDate
    } = req.body;

    if (!nameEn || !category || quantity === undefined || !pricePerUnit || !district) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    const images = (req.files || []).map((f) => `/uploads/products/${f.filename}`);

    const product = await Product.create({
      farmer: req.user._id,
      nameEn, nameTa, descriptionEn, descriptionTa, category,
      quantity, unit, pricePerUnit,
      district: district || req.user.district,
      village: village || req.user.village,
      images,
      contactName: contactName || req.user.name,
      contactMobile: contactMobile || req.user.mobile,
      isOrganic: isOrganic === 'true' || isOrganic === true,
      harvestDate: harvestDate || undefined
    });

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// @desc    Public product listing with filters: district, category, search, pagination
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { district, category, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const filter = { isPublished: true, isSoldOut: false };
    if (district) filter.district = district;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmer', 'name mobile district village isGovtIdVerified')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmer',
      'name mobile district village isGovtIdVerified farmName'
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// @desc    Get all products belonging to logged in farmer
// @route   GET /api/products/mine
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort('-createdAt');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your products', error: error.message });
  }
};

// @desc    Update a product - farmer can edit quantity, price, description etc.
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const editableFields = [
      'nameEn', 'nameTa', 'descriptionEn', 'descriptionTa', 'category',
      'quantity', 'unit', 'pricePerUnit', 'district', 'village',
      'contactName', 'contactMobile', 'isOrganic', 'harvestDate',
      'isPublished', 'isSoldOut'
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct
};
