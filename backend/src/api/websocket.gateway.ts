import { TokensManager } from "@app/core/auth/managers/tokens.manager";
import { AskQuestionEvent } from "@app/core/events/ask-question.event";
import { ShareholderImportProgressEvent } from "@app/core/events/shareholder-import-progress.event";
import { User } from "@app/data/model";
import { UserRepository } from "@app/data/repositories";
import { UnauthorizedException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { RoomEnum } from "@vpoll-shared/contract";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "/api",
  pingTimeout: 90000,
  cors: {
    origin: ['https://vpoll.com.my', 'https://www.vpoll.com.my', "https://localhost:4200", "http://localhost:4200", "http://localhost:8080", "https://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
})
export class WebsocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private userRepo: UserRepository, private tokenManager: TokensManager) {}

  @WebSocketServer()
  server: Server;

  public async handleConnection(client: Socket, ...args: any[]) {
    console.log('On Connect: New client attempting to connect...');
    console.log('Client handshake details:', client.handshake);

    const token = client.handshake.query?.token; // Corrected token extraction
    console.log('Extracted token:', token);

    if (!token) {
        console.log('Connection rejected: No token provided.');
        this.disconnect(client);
        return;
    }

    try {

        console.log('Token verified. User:');
    } catch (error) {
        console.error('Error verifying token:', error.message);
        this.disconnect(client);
    }
}

  public async handleDisconnect(client: Socket) {
    console.log("On Disconnect");
    console.log(client.id);
  }

  @SubscribeMessage("join-room")
  public async joinRoom(@MessageBody() room: { room: RoomEnum; eventId: string }, @ConnectedSocket() client: Socket) {
    console.log(typeof room);
    const token = client.handshake.auth.token;
    const user: User = await this.tokenManager.verifyJwtWithoutBearer(token);
    const roomTag = `${room.room}#${user.roles[0].companyId}#${room.eventId}`;

    console.log(`Join room ${roomTag}`);
    await client.join(roomTag);
    return roomTag;
  }

  @SubscribeMessage("leave-room")
  public async leaveRoom(@MessageBody() roomTag: string, @ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token;
    const user: User = await this.tokenManager.verifyJwtWithoutBearer(token);

    console.log(`Leave room ${roomTag}`);
    await client.leave(roomTag);
    return roomTag;
  }

  @OnEvent("shareholder.import-progress")
  broadCastShareholderImportProgress(payload: ShareholderImportProgressEvent) {
    console.log("Received shareholder.import-progress event with payload:", payload);

    const roomTag = `${RoomEnum.ADMIN_ROOM}#${payload.companyId}#${payload.eventId}`;
    console.log("Broadcasting to room:", roomTag);
  
    this.server.to(roomTag).emit("fileUploadStatus.shareholder", {
      status: payload.status,
      progress: payload.progress
    });
  
    console.log("Event emitted to room");
  }

  @OnEvent("ask-question")
  broadCastQuestion(payload: AskQuestionEvent) {
    const roomTag = `${RoomEnum.ADMIN_ROOM}#${payload.companyId}#${payload.eventId}`;
    this.server.to(roomTag).emit("ask-question", {
      question: payload.question,
      roles: payload.roles
    });
  }

  private disconnect(client: Socket) {
    client.emit("Error", new UnauthorizedException());
    client.disconnect();
  }
}
