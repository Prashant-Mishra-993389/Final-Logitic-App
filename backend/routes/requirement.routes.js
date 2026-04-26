const express = require('express');
const router = express.Router();

const {
  createRequirementField,
  getRequirementFieldsBySubcategory,
  updateRequirementField,
  deleteRequirementField
} = require('../controllers/requirement.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/subcategory/:subcategoryId', getRequirementFieldsBySubcategory);

router.post('/', protect, authorize('admin'), createRequirementField);
router.put('/:id', protect, authorize('admin'), updateRequirementField);
router.delete('/:id', protect, authorize('admin'), deleteRequirementField);

module.exports = router;