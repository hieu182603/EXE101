import { Controller, Get, Post, Param, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RoleService } from "./role.service";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { Role } from "./role.entity";
import { EntityNotFoundException } from "@/exceptions/http-exceptions";

@Service()
@Controller('/auth/roles')
export class RoleController{
    constructor(
        private readonly roleService: RoleService
    ){}

    @Get('/')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getAllRoles(){
        const result = await this.roleService.getAllRoles();
        return {
            success: true,
            data: result,
        };
    }

    @Get('/non-admin')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getNonAdminRoles(){
        const result = await this.roleService.getNonAdminRoles();
        return {
            success: true,
            data: result,
        };
    }

    @Get('/:slug')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getRoleBySlug(@Param('slug') slug: string){
        const role = await this.roleService.getRoleBySlug(slug);
        if (!role) {
            throw new EntityNotFoundException(`Role with slug '${slug}'`);
        }
        return {
            success: true,
            data: role,
        };
    }

    @Post('/create-default')
    @UseBefore(Admin)
    async createDefaultRoles(){
        const result = await this.roleService.createRoles();
        return {
            success: true,
            message: "Roles created successfully",
            data: result,
        };
    }
}












