const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  alt: String,
  caption: String,
});

const blogSchema = new mongoose.Schema({
  title: { 
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
  
  // Content
  content: { type: String, required: true },
  excerpt: String,
  
  // Featured Image
  featuredImage: imageSchema,
  
  // Gallery
  gallery: [imageSchema],
  
  // Category & Tags
  category: {
    type: String,
    enum: ['NEWS', 'PROMOTION', 'REVIEW', 'GUIDE', 'STORY', 'RECIPE'],
    required: true,
  },
  tags: [{ type: String, lowercase: true }],
  
  // Author
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  authorName: String,
  authorAvatar: String,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Status
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  publishedAt: Date,
  scheduledAt: Date,
  
  // Engagement
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // Interactions
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Settings
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  
  // Related products
  relatedProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
}, {
  timestamps: true,
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ isPinned: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text' 
});

// Virtual for is published
blogSchema.virtual('isPublished').get(function() {
  if (this.status !== 'PUBLISHED' && this.status !== 'SCHEDULED') {
    return false;
  }
  if (this.status === 'SCHEDULED' && this.scheduledAt > new Date()) {
    return false;
  }
  return true;
});

// Static method to generate slug
blogSchema.statics.generateSlug = function(title) {
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug;
};

// Increment view count
blogSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  await this.save();
};

// Toggle like
blogSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex(
    id => id.toString() === userIdStr
  );
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    this.likeCount -= 1;
  } else {
    this.likes.push(userId);
    this.likeCount += 1;
  }
  
  await this.save();
  return likeIndex === -1; // Returns true if liked, false if unliked
};

// Update comment count
blogSchema.statics.updateCommentCount = async function(blogId, delta = 1) {
  await this.findByIdAndUpdate(blogId, {
    $inc: { commentCount: delta },
  });
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
