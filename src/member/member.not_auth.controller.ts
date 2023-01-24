import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotAuthTag } from '../constant';
import { GetMemberResponse } from '../typings';

@ApiTags('member', NotAuthTag)
@Controller('member/not-auth')
export class MemberNotAuthController {
    constructor(private readonly memberService: MemberService) {}
    @ApiResponse({
        status: HttpStatus.OK,
        type: GetMemberResponse,
    })
    @Get('/info/:guildId/:userId')
    async GetMemberByGuildIdAndUserId(
        @Param('guildId') guildId: string,
        @Param('userId') userId: string,
    ): Promise<GetMemberResponse> {
        return {
            member: await this.memberService.findMemberByUserIdAndGuildId(
                userId,
                guildId,
            ),
            message: 'success',
        };
    }

    @ApiResponse({
        status: HttpStatus.OK,
        type: GetMemberResponse,
    })
    @Get('/info-by-id/:id')
    async GetMemberById(@Param('id') id: string): Promise<GetMemberResponse> {
        return {
            member: await this.memberService.findMemberById(id),
            message: 'success',
        };
    }
}
