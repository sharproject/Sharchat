import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInfoControllerReturn } from 'src/typings';

@ApiTags("User need auth")
@ApiBearerAuth()
@Controller('auth')
export class UserAuthController {
    constructor(private readonly userService: UserService) {}
  @ApiOperation({
    summary:"get me info",
  })
  @ApiResponse({
    status:200,
    description:"get me info success",
    type:UserInfoControllerReturn
  })
  @Get('me')
    async Me(@Res({ passthrough: true }) res: Response):Promise<UserInfoControllerReturn> {
        const UserInfo = await this.userService.findUserByID(String(res.locals.userId))
        if (!UserInfo){
          throw new HttpException({
              message:"user not found"
          },HttpStatus.BAD_REQUEST)
        }
        return {user : UserInfo, message:"get me info success"};
    }
}
