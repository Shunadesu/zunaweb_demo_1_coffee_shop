const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  
  // Hierarchical categories
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    default: null 
  },
  
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Stats
  productCount: { type: Number, default: 0 },
  
  // Admin
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
}, {
  timestamps: true,
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

// Static method to generate slug
categorySchema.statics.generateSlug = function(name) {
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
