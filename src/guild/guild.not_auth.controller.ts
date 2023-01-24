import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { GuildService } from './guild.service';
import { NotAuthTag } from '../constant';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetGuildInfoResponse } from '../typings';

@ApiTags('guild', NotAuthTag)
@Controller('guild/not-auth')
export class GuildNotAuthController {
    constructor(private readonly guildService: GuildService) {}
    @ApiResponse({
        status: HttpStatus.OK,
        type: GetGuildInfoResponse,
    })
    @Get('info/:id')
    async GetGuildInfo(@Param('id') id: string): Promise<GetGuildInfoResponse> {
        return {
            guild: await this.guildService.findGuildById(id),
            message: 'success',
        };
    }
}
