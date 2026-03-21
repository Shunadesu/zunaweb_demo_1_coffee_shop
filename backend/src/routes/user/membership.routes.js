const express = require('express');
const router = express.Router();
const membershipController = require('../../controllers/user/membershipController');
const { auth } = require('../../middleware/auth');

// All routes require auth
router.use(auth);

router.get('/', membershipController.getMembership);
router.get('/points', membershipController.getPoints);
router.get('/points/history', membershipController.getPointsHistory);
router.get('/benefits', membershipController.getBenefits);
router.get('/rewards', membershipController.getRewards);
router.post('/rewards/redeem', membershipController.redeemReward);
router.get('/rank', membershipController.getRank);
router.get('/rank/progress', membershipController.getRankProgress);

module.exports = router;
