const fs = require('fs');
const path = require('path');

const preferredRoot = process.env.NOVA_DATA_DIR || 'D:\\NOVA-data';
const dataRoot = fs.existsSync(path.parse(preferredRoot).root)
  ? preferredRoot
  : path.join(__dirname, '..', '.local-data');
const productUploadDir = path.join(dataRoot, 'uploads', 'products');

fs.mkdirSync(productUploadDir, { recursive: true });

module.exports = { dataRoot, productUploadDir };
