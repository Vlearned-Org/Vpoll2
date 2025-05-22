import { Injectable } from '@angular/core';
import {
  FileTypeEnum,
  ImportStatusEnum,
  RoomEnum,
} from '@vpoll-shared/contract';
import { RoleEnum } from '@vpoll-shared/enum';
import { SocketAuthService } from './socket-auth.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  public joinedEvent: string;
  private joinedRoom: string;

  constructor(private socket: SocketAuthService) {}

  public joinAdminEventRoom(eventId: string) {
    this.socket.refreshToken();
    this.socket.connect();
    this.socket.emit(
      'join-room',
      {
        room: RoomEnum.ADMIN_ROOM,
        eventId,
      },
      (roomTag) => {
        this.joinedEvent = eventId;
        this.joinedRoom = roomTag;
      }
    );
  }

  public leaveAdminEventRoom() {
    this.socket.refreshToken();
    this.socket.emit('leave-room', this.joinedRoom, (roomTag) => {
      this.joinedEvent = null;
      this.joinedRoom = null;
      this.socket.disconnect();
    });
  }

  public getUploadFileStatus(
    fileType: FileTypeEnum,
    cb: (data: { status: ImportStatusEnum; progress: number }) => any
  ) {
    this.socket.refreshToken();
    this.socket.connect();
    console.log('Attempting WebSocket connection...');
    console.log('WebSocket URL:', this.socket.ioSocket.io.uri);
    console.log('WebSocket connected:', this.socket.ioSocket.connected);
  
    this.socket.on(`fileUploadStatus.${fileType}`, (data) => {
      console.log(`Received file upload status for ${fileType}:`, data);
      cb(data);
    });
  }
  
  public questionAsked(
    cb: (data: { question: string; roles: RoleEnum[] }) => any
  ) {
    this.socket.refreshToken();
    this.socket.on(`ask-question`, cb);
  }

  public removeFileUpdateStatus(fileType: FileTypeEnum) {
    this.socket.refreshToken();
    this.socket.removeAllListeners(`fileUploadStatus.${fileType}`);
  }

  public removeAskQuestionListener() {
    this.socket.refreshToken();
    this.socket.removeAllListeners('ask-question');
  }
}
