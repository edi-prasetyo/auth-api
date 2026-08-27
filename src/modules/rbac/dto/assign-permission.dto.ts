import {
  IsInt,
  IsNotEmpty,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({
    example: 1,
    description: 'Role ID',
  })
  @IsInt()
  @IsNotEmpty()
  roleId!: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'List of permission IDs',
    type: [Number],
  })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  permissionIds!: number[];
}
