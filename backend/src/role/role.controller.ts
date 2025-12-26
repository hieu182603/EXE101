import { Controller, Get, Post, Param, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RoleService } from "./role.service";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { Role } from "./role.entity";

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
        return await this.roleService.getAllRoles();
    }

    @Get('/non-admin')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getNonAdminRoles(){
        return await this.roleService.getNonAdminRoles();
    }

    @Get('/:slug')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getRoleBySlug(@Param('slug') slug: string){
        const role = await this.roleService.getRoleBySlug(slug);
        if (!role) {
            throw new Error(`Role with slug '${slug}' not found`);
        }
        return role;
    }

    @Post('/create-default')
    @UseBefore(Admin)
    async createDefaultRoles(){
        await this.roleService.createRoles();
        return { message: "Default roles created successfully" };
    }
}












