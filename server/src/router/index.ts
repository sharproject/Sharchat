import { ChannelController } from '../controller/Channel'
import { GuildController } from '../controller/Guild'
import { MemberController } from '../controller/Member'
import { UserController } from '../controller/User'


export function SetupPath(app: import('express').Express) {
    UserController.SetupForRootApp("/user",app)
    MemberController.SetupForRootApp("/member",app)
    GuildController.SetupForRootApp("/guild",app)
    ChannelController.SetupForRootApp("/channel",app)
}
