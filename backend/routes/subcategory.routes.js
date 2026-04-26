const express = require('express');
const router = express.Router();

const {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory
} = require('../controllers/subcategory.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

router.post('/', protect, authorize('admin'), createSubcategory);
router.put('/:id', protect, authorize('admin'), updateSubcategory);
router.delete('/:id', protect, authorize('admin'), deleteSubcategory);

module.exports = router;