const multer = require('multer');
const path = require('path');
const fs = require('fs');

const config = require('../config/env');

const createStorage = (subFolder) => {
  const uploadPath = path.join(__dirname, '../../..', config.uploadPath, subFolder);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
      cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
};

const uploadMiddleware = (subFolder = 'misc') => {
  return multer({
    storage: createStorage(subFolder),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
  });
};

module.exports = uploadMiddleware;
