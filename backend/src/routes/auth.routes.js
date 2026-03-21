const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải từ 2-100 ký tự'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Số điện thoại là bắt buộc')
    .matches(/(84|0)[3|5|7|8|9][0-9]{8}/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ'),
  body('referralCode')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Mã giới thiệu không hợp lệ'),
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email hoặc số điện thoại là bắt buộc'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
];

const passwordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .notEmpty()
    .withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile
 * @access  Private
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', auth, passwordValidation, authController.changePassword);

module.exports = router;
