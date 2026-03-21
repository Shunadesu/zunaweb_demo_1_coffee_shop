import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const result = await register({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
        <p className="text-gray-500">Đăng ký để hưởng nhiều ưu đãi</p>
      </div>

      {(error || localError) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
        >
          {error || localError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Họ tên *</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input pl-10"
              placeholder="Nhập họ tên"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Số điện thoại *</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input pl-10"
              placeholder="0xxx xxx xxx"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input pl-10"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="label">Mật khẩu *</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input pl-10 pr-10"
              placeholder="Ít nhất 6 ký tự"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Xác nhận mật khẩu *</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input pl-10"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-center text-gray-500 mt-6 text-sm">
        Bằng việc đăng ký, bạn đã đồng ý với{' '}
        <a href="#" className="text-primary-600 hover:underline">
          Điều khoản sử dụng
        </a>{' '}
        và{' '}
        <a href="#" className="text-primary-600 hover:underline">
          Chính sách bảo mật
        </a>
      </p>

      <p className="text-center text-gray-500 mt-4">
        Đã có tài khoản?{' '}
        <a href="/login" className="text-primary-600 font-medium hover:underline">
          Đăng nhập
        </a>
      </p>
    </motion.div>
  );
};

export default Register;
