const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
}, { _id: true });

const sizeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    enum: ['S', 'M', 'L', 'XL'],
    required: true 
  },
  priceModifier: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

const toppingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  
  // Category
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  categoryName: { type: String }, // Snapshot for display
  
  // Media
  images: [imageSchema],
  
  // Description
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  ingredients: [{ type: String }],
  calories: Number,
  
  // Pricing
  basePrice: { type: Number, required: true },
  costPrice: Number, // For profit calculation
  
  // Options
  sizes: [sizeSchema],
  toppings: [toppingSchema],
  
  // Availability
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  
  // Stock
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  
  // Stats
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Admin
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || '');
});

// Static method to generate slug
productSchema.statics.generateSlug = function(name) {
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug;
};

// Update category product count
productSchema.post('save', async function() {
  await this.constructor.updateCategoryProductCount(this.category);
});

productSchema.post('findOneAndDelete', async function(doc) {
  if (doc?.category) {
    await this.constructor.updateCategoryProductCount(doc.category);
  }
});

productSchema.statics.updateCategoryProductCount = async function(categoryId) {
  const count = await this.countDocuments({ 
    category: categoryId, 
    isAvailable: true 
  });
  const Category = mongoose.model('Category');
  await Category.findByIdAndUpdate(categoryId, { productCount: count });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
