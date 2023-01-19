import { Controller, Get } from '@nestjs/common';

@Controller('guild')
export class GuildController {
    @Get()
    siu() {
        return 'siu';
    }
}
