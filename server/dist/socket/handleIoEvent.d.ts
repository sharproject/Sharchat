import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './SocketServerEvent';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
export declare class HandleEvent {
    socket: Server<ServerToClientEvents, ClientToServerEvents, DefaultEventsMap, SocketData>;
    constructor(socket: Server<ServerToClientEvents, ClientToServerEvents, DefaultEventsMap, SocketData>);
    AddEvent(): void;
    SetupMiddleware(): void;
}
