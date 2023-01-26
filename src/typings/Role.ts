import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsMongoId, IsBoolean } from 'class-validator';

export class CreateRoleInput {
	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsMongoId()
	guild: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsHexColor()
	color: string;

	@ApiProperty()
	@IsBoolean()
	hide: boolean = false;
}
