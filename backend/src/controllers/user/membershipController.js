const User = require('../../models/User');
const PointHistory = require('../../models/PointHistory');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

// Rank thresholds and benefits
const RANK_CONFIG = {
  BRONZE: {
    minSpent: 0,
    multiplier: 1.0,
    benefits: [
      '1% điểm/mua',
      'Mã giới thiệu',
    ],
  },
  SILVER: {
    minSpent: 500000,
    multiplier: 2.0,
    benefits: [
      '2% điểm/mua',
      'Giảm 5% cho đơn hàng',
      'Free ship cho đơn từ 300,000đ',
    ],
  },
  GOLD: {
    minSpent: 2000000,
    multiplier: 2.5,
    benefits: [
      '2.5% điểm/mua',
      'Giảm 10% cho đơn hàng',
      'Free ship cho đơn từ 200,000đ',
      'Ưu tiên xử lý',
    ],
  },
  PLATINUM: {
    minSpent: 5000000,
    multiplier: 3.0,
    benefits: [
      '3% điểm/mua',
      'Giảm 15% cho đơn hàng',
      'Free ship mọi đơn',
      'VIP support',
      'Quà sinh nhật đặc biệt',
    ],
  },
};

/**
 * @route   GET /api/user/membership
 * @desc    Get membership info
 * @access  User
 */
const getMembership = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const ranks = Object.entries(RANK_CONFIG);
  const currentRankIndex = ranks.findIndex(([name]) => name === user.memberRank);
  const nextRank = currentRankIndex < ranks.length - 1 
    ? ranks[currentRankIndex + 1][0] 
    : null;
  
  const pointsToNextRank = nextRank 
    ? Math.max(0, RANK_CONFIG[nextRank].minSpent - user.totalSpent)
    : 0;
  
  const progress = nextRank 
    ? Math.min(1, user.totalSpent / RANK_CONFIG[nextRank].minSpent)
    : 1;
  
  res.json({
    success: true,
    data: {
      memberCode: user.memberCode,
      memberRank: user.memberRank,
      points: user.pointBalance,
      totalSpent: user.totalSpent,
      referralCode: user.referralCode,
      nextRank,
      pointsToNextRank,
      progress,
      rankBenefits: RANK_CONFIG[user.memberRank].benefits,
      birthday: user.birthday,
    },
  });
});

/**
 * @route   GET /api/user/membership/points
 * @desc    Get points balance
 * @access  User
 */
const getPoints = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      pointBalance: user.pointBalance,
      totalEarned: user.points,
      equivalentValue: Math.floor(user.pointBalance / 100) * 1000,
    },
  });
});

/**
 * @route   GET /api/user/membership/points/history
 * @desc    Get points history
 * @access  User
 */
const getPointsHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  
  const query = { userId: req.user._id };
  if (type) query.type = type;
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [history, total] = await Promise.all([
    PointHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    PointHistory.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(history, total, page, limitNum));
});

/**
 * @route   GET /api/user/membership/benefits
 * @desc    Get rank benefits
 * @access  User
 */
const getBenefits = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      currentRank: user.memberRank,
      allRanks: RANK_CONFIG,
    },
  });
});

/**
 * @route   GET /api/user/membership/rewards
 * @desc    Get available rewards
 * @access  User
 */
const getRewards = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Available rewards based on points
  const rewards = [
    {
      id: 'reward-10',
      name: 'Giảm 10,000đ',
      pointsRequired: 1000,
      value: 10000,
      canRedeem: user.pointBalance >= 1000,
    },
    {
      id: 'reward-25',
      name: 'Giảm 25,000đ',
      pointsRequired: 2500,
      value: 25000,
      canRedeem: user.pointBalance >= 2500,
    },
    {
      id: 'reward-50',
      name: 'Giảm 50,000đ',
      pointsRequired: 5000,
      value: 50000,
      canRedeem: user.pointBalance >= 5000,
    },
    {
      id: 'reward-100',
      name: 'Giảm 100,000đ',
      pointsRequired: 10000,
      value: 100000,
      canRedeem: user.pointBalance >= 10000,
    },
  ];
  
  res.json({
    success: true,
    data: rewards,
  });
});

/**
 * @route   POST /api/user/membership/rewards/redeem
 * @desc    Redeem points for reward
 * @access  User
 */
const redeemReward = asyncHandler(async (req, res) => {
  const { rewardId } = req.body;
  
  const rewardValues = {
    'reward-10': { points: 1000, value: 10000 },
    'reward-25': { points: 2500, value: 25000 },
    'reward-50': { points: 5000, value: 50000 },
    'reward-100': { points: 10000, value: 100000 },
  };
  
  const reward = rewardValues[rewardId];
  if (!reward) {
    return res.status(400).json({
      success: false,
      message: 'Phần thưởng không hợp lệ',
    });
  }
  
  const user = await User.findById(req.user._id);
  
  if (user.pointBalance < reward.points) {
    return res.status(400).json({
      success: false,
      message: 'Điểm không đủ để đổi',
    });
  }
  
  // Deduct points
  user.pointBalance -= reward.points;
  await user.save();
  
  // Create history
  const pointHistory = new PointHistory({
    userId: user._id,
    type: 'REDEEM',
    points: -reward.points,
    balanceBefore: user.pointBalance + reward.points,
    balanceAfter: user.pointBalance,
    description: `Đổi điểm lấy voucher giảm ${reward.value.toLocaleString()}đ`,
  });
  await pointHistory.save();
  
  res.json({
    success: true,
    message: `Đã đổi thành công! Bạn nhận được voucher giảm ${reward.value.toLocaleString()}đ`,
    data: {
      voucherCode: `V${Date.now()}`,
      value: reward.value,
      pointsSpent: reward.points,
      remainingPoints: user.pointBalance,
    },
  });
});

/**
 * @route   GET /api/user/membership/rank
 * @desc    Get rank info
 * @access  User
 */
const getRank = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      currentRank: user.memberRank,
      rankInfo: RANK_CONFIG[user.memberRank],
      rankUpgradedAt: user.rankUpgradedAt,
    },
  });
});

/**
 * @route   GET /api/user/membership/rank/progress
 * @desc    Get rank progress
 * @access  User
 */
const getRankProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const ranks = Object.keys(RANK_CONFIG);
  const currentRankIndex = ranks.indexOf(user.memberRank);
  
  const progress = {
    current: {
      rank: user.memberRank,
      spent: user.totalSpent,
      minSpent: RANK_CONFIG[user.memberRank].minSpent,
    },
    next: null,
    milestones: [],
  };
  
  if (currentRankIndex < ranks.length - 1) {
    const nextRankName = ranks[currentRankIndex + 1];
    progress.next = {
      rank: nextRankName,
      minSpent: RANK_CONFIG[nextRankName].minSpent,
      pointsNeeded: Math.max(0, RANK_CONFIG[nextRankName].minSpent - user.totalSpent),
      benefits: RANK_CONFIG[nextRankName].benefits,
    };
  }
  
  // Add all milestones
  for (const [rankName, config] of Object.entries(RANK_CONFIG)) {
    progress.milestones.push({
      rank: rankName,
      minSpent: config.minSpent,
      isReached: user.totalSpent >= config.minSpent,
      isCurrent: rankName === user.memberRank,
    });
  }
  
  res.json({ success: true, data: progress });
});

module.exports = {
  getMembership,
  getPoints,
  getPointsHistory,
  getBenefits,
  getRewards,
  redeemReward,
  getRank,
  getRankProgress,
};
