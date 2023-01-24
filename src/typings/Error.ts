import { ApiProperty } from '@nestjs/swagger';

export class BaseErrorType {
	@ApiProperty({
		description: 'error message',
	})
	message: string;
}

export class UnAuthentication extends BaseErrorType {}
