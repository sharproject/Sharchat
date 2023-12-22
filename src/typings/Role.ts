import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
	IsHexColor,
	IsNotEmpty,
	IsMongoId,
	IsBoolean,
	IsNumber,
	IsArray,
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
	color?: string;

	@ApiProperty()
	@IsBoolean()
	hide = false;

	@ApiProperty()
	@IsNumber({})
	position?: number;

	@ApiProperty()
	@IsArray()
	permissions?: PermissionType[];
}

export class UpdateRoleInput extends OmitType(PartialType(CreateRoleInput), [
	'guildId',
]) {
	@ApiProperty({
		description:
			'THIS FIELD WILL BE CHANGE BY SET PERMISSION WRITE ALL PERMISSION YOU WANT',
	})
	@IsArray()
	permissions: PermissionType[];
}
