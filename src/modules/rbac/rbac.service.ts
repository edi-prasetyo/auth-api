import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAllRoles() {
    return this.roleRepository.find();
  }

  async findOneRole(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: assignRoleDto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: assignRoleDto.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const userRole = this.userRoleRepository.create({
      userId: assignRoleDto.userId,
      roleId: assignRoleDto.roleId,
    });

    return this.userRoleRepository.save(userRole);
  }

  async removeRoleFromUser(assignRoleDto: AssignRoleDto) {
    const result = await this.userRoleRepository.delete({
      userId: assignRoleDto.userId,
      roleId: assignRoleDto.roleId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User role assignment not found');
    }

    return { message: 'Role removed from user successfully' };
  }

  async assignPermissionsToRole(assignPermissionDto: AssignPermissionDto) {
    const role = await this.roleRepository.findOne({
      where: { id: assignPermissionDto.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(assignPermissionDto.permissionIds) },
    });

    if (permissions.length !== assignPermissionDto.permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    await this.rolePermissionRepository.delete({
      roleId: assignPermissionDto.roleId,
    });

    const rolePermissions = permissions.map((permission) =>
      this.rolePermissionRepository.create({
        roleId: assignPermissionDto.roleId,
        permissionId: permission.id,
      }),
    );

    return this.rolePermissionRepository.save(rolePermissions);
  }

  async getUserRoles(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: { role: true },
    });

    return userRoles.map((ur) => ur.role);
  }

  async getUserPermissions(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: { role: { rolePermissions: true } },
    });

    const permissions = new Map<number, Permission>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.rolePermissions || []) {
        if (rolePermission.permission) {
          permissions.set(
            rolePermission.permission.id,
            rolePermission.permission,
          );
        }
      }
    }

    return Array.from(permissions.values());
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: { role: true },
    });

    return userRoles.some((ur) => ur.role.name === roleName);
  }

  async hasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((permission) => permission.name === permissionName);
  }

  async createPermission(name: string, description?: string) {
    const permission = this.permissionRepository.create({ name, description });
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions() {
    return this.permissionRepository.find();
  }
}
