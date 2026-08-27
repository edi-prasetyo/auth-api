import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @ApiProperty({
    example: 1,
    description: 'Role ID',
  })
  @IsInt()
  @IsNotEmpty()
  roleId!: number;
}
