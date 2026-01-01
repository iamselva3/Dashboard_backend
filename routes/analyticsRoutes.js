import express from 'express';
import {
    getAnalytics,
    createAnalytics,
    getAnalyticsSummary
} from '../controllers/analyticsController.js';

const router = express.Router();

router.route('/').get(getAnalytics).post(createAnalytics);
router.route('/summary').get(getAnalyticsSummary);

export default router;