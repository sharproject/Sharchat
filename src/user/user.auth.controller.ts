import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('auth')
export class UserAuthController {
    constructor(private readonly userService: UserService) {}
    @Get('me')
    async Me(@Res({ passthrough: true }) res: Response) {
        return await this.userService.findUserByID(String(res.locals.userId));
    }
}
