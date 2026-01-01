
import express from 'express';
import {
    getFilters,
    getFilterByType,
    createFilter,
    updateFilter,
    deleteFilter,
    saveFilterConfig
} from '../controllers/filterController.js';

const router = express.Router();

router.route('/').get(getFilters).post(createFilter);
router.route('/save').post(saveFilterConfig);
router.route('/:type').get(getFilterByType);
router.route('/:id').put(updateFilter).delete(deleteFilter);

export default router;