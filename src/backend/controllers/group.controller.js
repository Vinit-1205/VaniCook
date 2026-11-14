import { GroupService } from '../services/group.service.js';
import { MatchingService } from '../services/matching.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class GroupController {
  static async createGroup(req, res, next) {
    try {
      const group = await GroupService.createGroupRequest(req.user.id, req.body);
      return ApiResponse.created(res, 'Neighbourhood group request created', group);
    } catch (error) {
      next(error);
    }
  }

  static async listGroups(req, res, next) {
    try {
      const societyId = req.query.societyId || req.user?.primarySocietyId;
      const groups = await GroupService.listGroups(societyId, req.user?.id);
      return ApiResponse.success(res, 'Groups retrieved', groups);
    } catch (error) {
      next(error);
    }
  }

  static async findCompatibleCooks(req, res, next) {
    try {
      const group = await GroupService.listGroups(null, req.user?.id);
      const targetGroup = group.find((g) => g.id === req.params.id);

      if (!targetGroup) {
        return ApiResponse.error(res, 'Group not found', 404);
      }

      const recommendations = await MatchingService.findCompatibleCooksForGroup(targetGroup);
      return ApiResponse.success(res, 'Compatible cooks recommended', recommendations);
    } catch (error) {
      next(error);
    }
  }

  static async joinGroup(req, res, next) {
    try {
      const result = await GroupService.joinGroup(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, 'Successfully joined neighbourhood pool', result);
    } catch (error) {
      next(error);
    }
  }

  static async leaveGroup(req, res, next) {
    try {
      const result = await GroupService.leaveGroup(req.params.id, req.user.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async assignCook(req, res, next) {
    try {
      const { cookProfileId } = req.body;
      const result = await GroupService.assignCook(req.params.id, cookProfileId, req.user.id);
      return ApiResponse.success(res, 'Cook assigned to group pool', result);
    } catch (error) {
      next(error);
    }
  }

  static async respondToGroup(req, res, next) {
    try {
      const { decision } = req.body;
      const result = await GroupService.respondToGroupRequest(req.user.id, req.params.id, decision);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

