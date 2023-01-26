import { Controller, Get, HttpException, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Body, Param, Res } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import * as bcrypt from 'bcrypt';
import { AuthenticationService } from '../Authentication/authentication.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	LoginUserInput,
	UserLoginRegisterControllerReturn,
	RegisterUserInput,
	UserInfoControllerReturn,
} from '../typings';
import { NotAuthTag } from '../constant';

@ApiTags('user', NotAuthTag)
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly AuthService: AuthenticationService,
	) {}

	@ApiOperation({ summary: 'Register new user' })
	@ApiResponse({
		status: 200,
		description: 'Create new user success',
		type: UserLoginRegisterControllerReturn,
	})
	@Post('register')
	async RegisterUser(
		@Body() registerData: RegisterUserInput,
	): Promise<UserLoginRegisterControllerReturn> {
		const { email, password, username } = registerData;

		const alreadyUser =
			(await this.userService.findUserByEmail(email)) ||
			(await this.userService.findUserByUsername(username));
		if (alreadyUser) {
			throw new HttpException(
				{
					message: 'Username or email is already taken',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const hashPassword = await bcrypt.hash(password, 10);
		const user = await this.userService.CreateNewUser({
			username,
			email,
			password: hashPassword,
		});
		return {
			message: 'User created successfully',
			token: await this.AuthService.GenToken(user._id),
			user,
		};
	}

	@ApiOperation({ summary: 'User login' })
	@ApiResponse({
		status: 200,
		description: 'User login Success',
		type: UserLoginRegisterControllerReturn,
	})
	@Post('login')
	async UserLogin(
		@Body() input: LoginUserInput,
	): Promise<UserLoginRegisterControllerReturn> {
		const { emailOrUsername, password } = input;

		const user =
			(await this.userService.findUserByEmail(emailOrUsername)) ||
			(await this.userService.findUserByUsername(emailOrUsername));
		if (!user) {
			throw new HttpException(
				{
					message: 'User not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new HttpException(
				{
					message: 'Password is incorrect',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return {
			message: 'Login successfully',
			token: await this.AuthService.GenToken(user._id),
			user,
		};
	}

	@ApiOperation({
		summary: 'Get User Info by id',
	})
	@ApiResponse({
		status: 200,
		description: 'get user info success',
		type: UserInfoControllerReturn,
	})
	@Get('profile/:id')
	async findOne(@Param('id') id: string): Promise<UserInfoControllerReturn> {
		const userInfo = await this.userService.findUserByID(id);
		if (!userInfo) {
			throw new HttpException(
				{
					message: 'User not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		userInfo.email = '';
		return {
			user: userInfo,
			message: 'Get user info success',
		};
	}
}
