import { Router } from 'express';
import * as movieController from '../controllers/movieController.js';
import { verifyAccessToken } from '../middleware/auth.js';

const router = Router();

router.get('/trending', verifyAccessToken, movieController.getTrending);
router.get('/top-rated', verifyAccessToken, movieController.getTopRated);
router.get('/popular', verifyAccessToken, movieController.getPopular);
router.get('/featured', verifyAccessToken, movieController.getFeatured);

export default router;
