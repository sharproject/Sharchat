import { Controller, Get, HttpException, Post } from '@nestjs/common';
import { LoginUserInput, RegisterUserInput, UserService } from './user.service';
import { Body, Param, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common/enums';
import * as bcrypt from 'bcrypt';
import { AuthenticationService } from '../Authentication/authentication.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly AuthService: AuthenticationService,
    ) {}

    @Post('register')
    async RegisterUser(
        @Body() registerData: RegisterUserInput,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { email, password, username } = registerData;

        try {
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
        } catch (error) {
            throw new HttpException(
                'INTERNAL SERVER ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('login')
    async UserLogin(
        @Body() input: LoginUserInput,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { emailOrUsername, password } = input;

        try {
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
        } catch (error) {
            throw new HttpException(
                'INTERNAL SERVER ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('profile/:id')
    async findOne(@Param('id') id: string) {
        return await this.userService.findUserByID(id);
    }
}
