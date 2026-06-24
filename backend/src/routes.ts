import { Router } from 'express';
import { OrderController } from '@/modules/order/order.controller';

const router = Router();
const orderController = new OrderController();

router.post('/orders', (req, res) => orderController.create(req, res));
router.get('/orders', (req, res) => orderController.findAll(req, res));
router.get('/orders/track/:trackingNumber', (req, res) => orderController.track(req, res));
router.get('/orders/:id', (req, res) => orderController.findOne(req, res));
router.patch('/orders/:id/status', (req, res) => orderController.updateStatus(req, res));
router.post('/orders/:id/cancel', (req, res) => orderController.cancel(req, res));

export default router;
