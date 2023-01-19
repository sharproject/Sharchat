import { Controller, Get, Post } from '@nestjs/common';
import { LoginUserInput, RegisterUserInput, UserService } from './user.service';
import { Body, Param, Res } from '@nestjs/common/decorators';
import { Request, Response } from 'express';
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
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Username or email is already taken',
                });
                return;
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await this.userService.CreateNewUser({
                username,
                email,
                password: hashPassword,
            });
            res.status(HttpStatus.CREATED).json({
                message: 'User created successfully',
                token: await this.AuthService.GenToken(user._id),
                user,
            });
            return;
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: error.message,
            });
            return;
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
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'User not found',
                });
                return;
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Password is incorrect',
                });
                return;
            }
            res.status(200).json({
                message: 'Login successfully',
                token: await this.AuthService.GenToken(user._id),
                user,
            });
            return;
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
            return;
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findUserByID(id);
    }
}
