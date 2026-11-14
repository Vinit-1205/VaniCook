import { Router } from 'express';
import { GroupController } from '../controllers/group.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createGroupSchema,
  joinGroupSchema,
  assignCookSchema,
  respondCookGroupSchema,
} from '../validators/group.validator.js';

const router = Router();

// Public / Authenticated list of groups in a society
router.get('/', authenticate, GroupController.listGroups);

// Customer creates a new neighbourhood cooking pool
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  validate(createGroupSchema),
  GroupController.createGroup
);

// Get intelligent matching cooks for a specific group pool
router.get('/:id/matching-cooks', authenticate, GroupController.findCompatibleCooks);

// Customer joins an open group pool
router.post(
  '/:id/join',
  authenticate,
  authorize('CUSTOMER'),
  validate(joinGroupSchema),
  GroupController.joinGroup
);

// Customer leaves a group pool
router.post('/:id/leave', authenticate, authorize('CUSTOMER'), GroupController.leaveGroup);

// Creator assigns a cook to the group pool
router.post(
  '/:id/assign-cook',
  authenticate,
  authorize('CUSTOMER'),
  validate(assignCookSchema),
  GroupController.assignCook
);

// Cook accepts or rejects the group request
router.post(
  '/:id/respond',
  authenticate,
  authorize('COOK'),
  validate(respondCookGroupSchema),
  GroupController.respondToGroup
);

export default router;

