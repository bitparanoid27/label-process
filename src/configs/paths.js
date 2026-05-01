// External modules

const path = require('path');
const projectRoot = path.join(__dirname, '..', '..');

const PATHS = {
  root: projectRoot,
  uploads: path.join(projectRoot, 'uploads'),
  boxes: path.join(projectRoot, 'temp-boxes'),
  orders: path.join(projectRoot, 'temp-orders'),
  products: path.join(projectRoot, 'temp-products'),
};

module.exports = PATHS;
