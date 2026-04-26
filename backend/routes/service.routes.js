const express = require('express');
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesBySubcategory
} = require('../controllers/service.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getServices);
router.get('/subcategory/:subcategoryId', getServicesBySubcategory);
router.get('/:id', getServiceById);

router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;