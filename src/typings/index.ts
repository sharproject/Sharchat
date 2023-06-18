import { ApiProperty } from '@nestjs/swagger';
import { from } from 'rxjs';

export class BaseControllerResponse {
	@ApiProperty({
		description: 'Controller Message',
	})
	message: string;
}

export * from './User';
export * from './Error';
export * from './Guild';
export * from './Role';
export * from './Member';
export * from "./Util";
export * from "./Channel";