import { create } from 'zustand';
import { userMembershipApi } from '@/api/user/membershipApi';

export const useMembershipStore = create((set, get) => ({
  membership: null,
  points: null,
  pointsHistory: [],
  benefits: null,
  rewards: [],
  rankProgress: null,
  isLoading: false,
  error: null,

  // Fetch membership info
  fetchMembership: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userMembershipApi.getMembership();
      set({ membership: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch points
  fetchPoints: async () => {
    try {
      const response = await userMembershipApi.getPoints();
      set({ points: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch points history
  fetchPointsHistory: async (params = {}) => {
    try {
      const response = await userMembershipApi.getPointsHistory(params);
      set({ pointsHistory: response.data });
      return response;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  // Fetch benefits
  fetchBenefits: async () => {
    try {
      const response = await userMembershipApi.getBenefits();
      set({ benefits: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch rewards
  fetchRewards: async () => {
    try {
      const response = await userMembershipApi.getRewards();
      set({ rewards: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Redeem reward
  redeemReward: async (rewardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userMembershipApi.redeemReward(rewardId);
      // Update local points
      if (get().membership) {
        set({
          membership: {
            ...get().membership,
            points: response.data.remainingPoints,
          },
          isLoading: false,
        });
      }
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Fetch rank progress
  fetchRankProgress: async () => {
    try {
      const response = await userMembershipApi.getRankProgress();
      set({ rankProgress: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch all membership data
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchMembership(),
        get().fetchPoints(),
        get().fetchBenefits(),
        get().fetchRewards(),
        get().fetchRankProgress(),
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
