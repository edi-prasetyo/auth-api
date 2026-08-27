import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('admin')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles' })
  @Roles('admin')
  async findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Return role by ID' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Roles('admin')
  async findOneRole(@Param('id') id: string) {
    return this.rbacService.findOneRole(parseInt(id, 10));
  }

  @Post('users/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 201, description: 'Role assigned to user' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @Roles('admin')
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(assignRoleDto);
  }

  @Post('users/roles/remove')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Role removed from user' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @Roles('admin')
  async removeRoleFromUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rbacService.removeRoleFromUser(assignRoleDto);
  }

  @Post('roles/permissions')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiBody({ type: AssignPermissionDto })
  @ApiResponse({ status: 200, description: 'Permissions assigned to role' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @Roles('admin')
  async assignPermissionsToRole(
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return this.rbacService.assignPermissionsToRole(assignPermissionDto);
  }

  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'Return user roles' })
  @Roles('admin')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(parseInt(userId, 10));
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'Return user permissions' })
  @Roles('admin')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(parseInt(userId, 10));
  }
}
