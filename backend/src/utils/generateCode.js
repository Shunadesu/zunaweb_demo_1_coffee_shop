/**
 * Generate unique codes for various entities
 */
class CodeGenerator {
  /**
   * Generate member code: CAFE20240001
   */
  static memberCode(year) {
    const count = Date.now() % 10000;
    return `CAFE${year}${String(count).padStart(4, '0')}`;
  }
  
  /**
   * Generate referral code: REF + 6 chars
   */
  static referralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'REF';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  /**
   * Generate coupon code: PREFIX + 6 chars
   */
  static couponCode(prefix = 'PROMO') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  /**
   * Generate order number: CF + YYYYMMDD + 4 digits
   */
  static orderNumber(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(Date.now() % 10000).padStart(4, '0');
    return `CF${year}${month}${day}${time}`;
  }
  
  /**
   * Generate slug from string
   */
  static slug(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  /**
   * Generate OTP code
   */
  static otp(length = 6) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }
}

module.exports = CodeGenerator;
