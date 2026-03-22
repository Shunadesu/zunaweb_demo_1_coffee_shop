const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One wishlist per user
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    note: String // Optional note
  }],
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });
wishlistSchema.index({ 'products.addedAt': -1 });

// Virtual to get product details
wishlistSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'products.product',
  foreignField: '_id'
});

// Update totalItems before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.products.length;
  next();
});

// Static method to add product to wishlist
wishlistSchema.statics.addProduct = async function(userId, productId, note = null) {
  let wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = new this({ user: userId, products: [] });
  }
  
  // Check if product already in wishlist
  const existingIndex = wishlist.products.findIndex(
    p => p.product.toString() === productId.toString()
  );
  
  if (existingIndex === -1) {
    wishlist.products.push({ product: productId, note });
    await wishlist.save();
    return { added: true, wishlist };
  } else {
    return { added: false, wishlist, message: 'Sản phẩm đã có trong danh sách yêu thích' };
  }
};

// Static method to remove product from wishlist
wishlistSchema.statics.removeProduct = async function(userId, productId) {
  const wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    return { removed: false, message: 'Không tìm thấy danh sách yêu thích' };
  }
  
  const initialLength = wishlist.products.length;
  wishlist.products = wishlist.products.filter(
    p => p.product.toString() !== productId.toString()
  );
  
  if (wishlist.products.length < initialLength) {
    await wishlist.save();
    return { removed: true, wishlist };
  } else {
    return { removed: false, message: 'Sản phẩm không có trong danh sách yêu thích' };
  }
};

// Static method to check if product is in wishlist
wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  const wishlist = await this.findOne({ 
    user: userId,
    'products.product': productId
  });
  return !!wishlist;
};

// Static method to get wishlist with product details
wishlistSchema.statics.getWishlistWithDetails = async function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const wishlist = await this.findOne({ user: userId })
    .populate({
      path: 'products.product',
      select: 'name primaryImage basePrice rating reviewCount isActive category slug'
    })
    .lean();
  
  if (!wishlist) {
    return { products: [], total: 0 };
  }
  
  // Filter out deleted/unavailable products
  const activeProducts = wishlist.products.filter(p => p.product !== null);
  const paginatedProducts = activeProducts.slice(skip, skip + limit);
  
  return {
    products: paginatedProducts,
    total: activeProducts.length,
    pagination: {
      page,
      limit,
      pages: Math.ceil(activeProducts.length / limit)
    }
  };
};

// JSON transform
wishlistSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
