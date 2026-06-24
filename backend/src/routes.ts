import { Router } from 'express';
import { ItemController } from '@/modules/item/item.controller';

const router = Router();
const itemController = new ItemController();

router.post('/items', (req, res) => itemController.create(req, res));
router.get('/items', (req, res) => itemController.findAll(req, res));
router.get('/items/:id', (req, res) => itemController.findOne(req, res));
router.patch('/items/:id', (req, res) => itemController.update(req, res));
router.delete('/items/:id', (req, res) => itemController.remove(req, res));

export default router;
