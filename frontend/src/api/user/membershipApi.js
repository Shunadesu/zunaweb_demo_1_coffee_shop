import axiosClient from './axiosClient';

export const userMembershipApi = {
  getMembership: () => axiosClient.get('/user/membership'),
  getPoints: () => axiosClient.get('/user/membership/points'),
  getPointsHistory: (params) => axiosClient.get('/user/membership/points/history', { params }),
  getBenefits: () => axiosClient.get('/user/membership/benefits'),
  getRewards: () => axiosClient.get('/user/membership/rewards'),
  redeemReward: (rewardId) => axiosClient.post('/user/membership/rewards/redeem', { rewardId }),
  getRank: () => axiosClient.get('/user/membership/rank'),
  getRankProgress: () => axiosClient.get('/user/membership/rank/progress'),
};
