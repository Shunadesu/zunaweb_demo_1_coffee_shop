class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  
  static unauthorized(message = 'Không có quyền truy cập') {
    return new ApiError(401, message);
  }
  
  static forbidden(message = 'Bạn không có quyền thực hiện hành động này') {
    return new ApiError(403, message);
  }
  
  static notFound(message = 'Không tìm thấy tài nguyên') {
    return new ApiError(404, message);
  }
  
  static conflict(message) {
    return new ApiError(409, message);
  }
  
  static internal(message = 'Lỗi server') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
