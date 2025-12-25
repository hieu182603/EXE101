import { Router } from "express";
import { Container } from "typedi";
import { RoleController } from "./role.controller";
import { Auth, Admin } from "@/middlewares/auth.middleware";
import { checkAbility } from "@/middlewares/rbac/permission.middleware";
import { Role } from "./role.entity";

const router = Router();
const roleController = Container.get(RoleController);

/**
 * GET /api/auth/roles
 * Get all roles (requires authentication and read permission)
 */
router.get("/auth/roles", Auth as any, checkAbility("read", Role), async (req: any, res, next) => {
  try {
    const result = await roleController.getAllRoles(req);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/auth/roles/create-roles
 * Create default roles (admin only)
 */
router.post("/auth/roles/create-roles", Admin as any, async (req, res, next) => {
  try {
    const result = await roleController.createRoles();
    res.json({
      success: true,
      message: "Roles created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;








