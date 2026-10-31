import { Router } from 'express'
import { listWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workerController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listWorkers)
router.post('/', requireRole('owner', 'admin', 'manager'), createWorker)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateWorker)
router.delete('/:id', requireRole('owner', 'admin'), deleteWorker)
export default router