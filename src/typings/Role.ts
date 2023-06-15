import { ApiProperty } from '@nestjs/swagger';
import {
	IsHexColor,
	IsNotEmpty,
	IsMongoId,
	IsBoolean,
	IsNumber,
	IsObject,
} from 'class-validator';
import { PermissionType } from './Util';

export class CreateRoleInput {
	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsMongoId()
	guildId: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsHexColor()
	color: string;

	@ApiProperty()
	@IsBoolean()
	hide: boolean = false;

	@ApiProperty()
	@IsNumber({})
	position?: number;

	@ApiProperty()
	permission: PermissionType[];
}
