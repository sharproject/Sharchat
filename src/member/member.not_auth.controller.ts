import { Controller, Get, Param } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member/not-auth')
export class MemberNotAuthController {
    constructor(private readonly memberService: MemberService) {}
    @Get('/info/:guildId/userId')
    async GetMemberByGuildIdAndUserId(
        @Param('guildId') guildId: string,
        @Param('userId') userId: string,
    ) {
        return await this.memberService.findMemberByUserIdAndGuildId(
            userId,
            guildId,
        );
    }
}
