import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@Injectable({
  providedIn: 'root',
})
export class SocketAuthService extends Socket {
  constructor() {
    const websocketProtcol = environment.production ? 'wss' : 'ws';
    const websocketURL = environment.API_URL.replace(
      /^https?/,
      websocketProtcol
    );

    const socketIoConfig: SocketIoConfig = {
      url: `${websocketURL}`,
      // url: environment.API_URL, // Ensure wss:// is used
      options: {
        query: {
          token: tokenGetter(),
        },
        transports: ['websocket'], // Use WebSocket only
      },
    };

    console.log('Socket IO Config:', socketIoConfig);
    super(socketIoConfig);
    this.ioSocket.on('connect', () =>
      console.log('WebSocket connected:', this.ioSocket.id)
    );
    this.ioSocket.on('disconnect', (reason) =>
      console.log('WebSocket disconnected:', reason)
    );
    this.ioSocket.on('connect_error', (error) =>
      console.error('WebSocket connection error:', error)
    );
    this.ioSocket.on('error', (error) =>
      console.error('WebSocket error:', error)
    );
  }

  refreshToken() {
    this.ioSocket['auth'] = { token: tokenGetter() };
    console.log('Token refreshed:', tokenGetter());
  }
}
