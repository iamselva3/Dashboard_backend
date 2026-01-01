import express from 'express';
import {
    getData,
    getStats,
    getFilterOptions,
    getVisualizationData,
    exportData
} from '../controllers/dataController.js';

const router = express.Router();

router.route('/').get(getData);
router.route('/stats').get(getStats);
router.route('/filters').get(getFilterOptions);
router.route('/visualization').post(getVisualizationData);
router.route('/export').post(exportData);

export default router;