import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiGift, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';
import { useMembershipStore } from '@/stores/membershipStore';

const Membership = () => {
  const {
    membership,
    benefits,
    rewards,
    rankProgress,
    fetchAll,
    redeemReward,
    isLoading,
  } = useMembershipStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rankIcons = {
    BRONZE: FiStar,
    SILVER: FiAward,
    GOLD: FiZap,
    PLATINUM: FiZap,
  };

  const rankColors = {
    BRONZE: 'from-amber-600 to-amber-800',
    SILVER: 'from-gray-400 to-gray-600',
    GOLD: 'from-yellow-500 to-yellow-700',
    PLATINUM: 'from-purple-500 to-purple-800',
  };

  const RankIcon = membership ? rankIcons[membership.memberRank] : FiStar;

  if (!membership) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="section-title mb-8">Thành viên</h1>

        {/* Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${rankColors[membership.memberRank]} text-white rounded-2xl p-8 mb-8`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
                <RankIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Hạng thành viên</p>
                <h2 className="text-3xl font-bold">{membership.memberRank}</h2>
                <p className="text-white/80">Mã: {membership.memberCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Điểm tích lũy</p>
              <p className="text-4xl font-bold">{membership.points.toLocaleString()}</p>
              <p className="text-white/80 text-sm">
                ≈ {(membership.points / 100 * 1000).toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Progress to next rank */}
          {rankProgress?.next && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Tiến đến {rankProgress.next.rank}</span>
                <span>{Math.round(rankProgress.progress * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${rankProgress.progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-white/80 mt-2">
                Cần thêm {(rankProgress.next.pointsNeeded || 0).toLocaleString()}đ để lên {rankProgress.next.rank}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiGift className="mr-2" />
              Quyền lợi thành viên
            </h3>
            <ul className="space-y-3">
              {membership.rankBenefits?.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <FiStar className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Đổi thưởng
            </h3>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-gray-500">
                      {reward.pointsRequired.toLocaleString()} điểm
                    </p>
                  </div>
                  <button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!reward.canRedeem || isLoading}
                    className={`btn text-sm ${
                      reward.canRedeem ? 'btn-primary' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    Đổi
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Referral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-50 rounded-xl p-6 mt-8"
        >
          <h3 className="font-semibold text-lg mb-4">Giới thiệu bạn bè</h3>
          <p className="text-gray-600 mb-4">
            Chia sẻ mã giới thiệu của bạn để nhận thêm điểm thưởng!
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-white rounded-lg p-3 font-mono text-lg text-center">
              {membership.referralCode}
            </div>
            <button className="btn-primary">Sao chép</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Membership;
