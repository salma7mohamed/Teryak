const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_teryak_2026';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 401, 'المستخدم غير موجود أو تم حذف الحساب');
      }

      if (user.status === 'suspended') {
        return errorResponse(res, 403, 'تم تجميد هذا الحساب من قِبل الإدارة');
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return errorResponse(res, 401, 'جلسة غير صالحة أو منتهية، يرجى إعادة تسجيل الدخول');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً');
  }
};

module.exports = { protect };
