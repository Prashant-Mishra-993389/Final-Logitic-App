const express = require('express');
const router = express.Router();

const {
  createAMCPlan,
  getAMCPlans,
  getAMCPlanById,
  updateAMCPlan,
  deleteAMCPlan
} = require('../controllers/amc.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getAMCPlans);
router.get('/:id', getAMCPlanById);

router.post('/', protect, authorize('admin'), createAMCPlan);
router.put('/:id', protect, authorize('admin'), updateAMCPlan);
router.delete('/:id', protect, authorize('admin'), deleteAMCPlan);

module.exports = router;