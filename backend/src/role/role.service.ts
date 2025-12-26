import { Service } from "typedi";
import { Role } from "./role.entity";
import { Not, In } from "typeorm";

export interface RoleDefinition {
  name: string;
  slug: string;
  description?: string;
}

@Service()
export class RoleService {
  private readonly defaultRoles: RoleDefinition[] = [
    { name: "admin", slug: "admin", description: "System administrator with full access" },
    { name: "manager", slug: "manager", description: "Manager with account and order management access" },
    { name: "staff", slug: "staff", description: "Staff with product and order management access" },
    { name: "customer", slug: "customer", description: "Customer with basic access" },
    { name: "shipper", slug: "shipper", description: "Shipper with order delivery access" },
  ];

  async createRoles(): Promise<void> {
    const existingRoles = await Role.find({
      select: ["slug"]
    });

    const existingSlugs = new Set(existingRoles.map(role => role.slug));
    const rolesToCreate = this.defaultRoles.filter(role => !existingSlugs.has(role.slug));

    if (rolesToCreate.length === 0) {
      console.log("All default roles already exist");
      return;
    }

    for (const roleDef of rolesToCreate) {
      const role = new Role();
      role.name = roleDef.name;
      role.slug = roleDef.slug;
      await role.save();
      console.log(`✅ Created role: ${roleDef.name}`);
    }

    console.log(`Created ${rolesToCreate.length} new roles`);
  }

  async getAllRoles(): Promise<Role[]> {
    return await Role.find({
      order: { name: "ASC" }
    });
  }

  async getNonAdminRoles(): Promise<Role[]> {
    return await Role.find({
      where: {
        slug: Not("admin"),
      },
      order: { name: "ASC" }
    });
  }

  async getRoleBySlug(slug: string): Promise<Role | null> {
    return await Role.findOne({
      where: { slug },
      relations: ["accounts"]
    });
  }

  async validateRoleExists(slug: string): Promise<boolean> {
    const role = await Role.findOne({
      where: { slug },
      select: ["id"]
    });
    return !!role;
  }
}












