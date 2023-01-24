import { IsEmail, IsNotEmpty } from 'class-validator';
import { BaseController } from '.';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../model/User';

export class UserLoginRegisterControllerReturn extends BaseController {
    @ApiProperty({
        description: 'User token',
    })
    token: string;
    @ApiProperty({
        description: 'User Info',
    })
    user: User;
}

export class UserInfoControllerReturn extends BaseController {
    @ApiProperty({
        description: 'User Info',
    })
    user: User ;
}

export class RegisterUserInput {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;
    @ApiProperty()
    @IsNotEmpty()
    username: string;
}

export class LoginUserInput {
    @IsNotEmpty()
    @ApiProperty()
    emailOrUsername: string;
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}
