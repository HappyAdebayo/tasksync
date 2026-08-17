'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { refreshNotifications } from './invites';
import { refreshWorkspaces } from './workspaces';
import { refreshBoards } from './board-utils';
import { getAuthToken } from './api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: any; 
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
});

const WS_URL = (
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXTPUBLICAPIURL ||
  ''
).replace(/\/+$/, '');

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!WS_URL && typeof window !== 'undefined') {
      console.warn('[TaskSync WebSocket] NEXT_PUBLIC_API_URL is not set. WebSocket cannot establish connection to backend.');
    }

    const token = getAuthToken();

    const socketInstance = io(WS_URL || undefined, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: token || undefined,
      },
      query: {
        token: token || undefined,
      },
    });

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected with socket ID:', socketInstance.id);
      setIsConnected(true);

      const currentToken = getAuthToken();
      if (currentToken) {
        socketInstance.emit('authenticate', { token: currentToken });
      }
      socketInstance.emit('test-message', 'Hello NestJS from dashboard');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('[WebSocket] User room authenticated:', data);
    });

    socketInstance.on('test-response', (data) => {
      console.log('[WebSocket] Server response:', data);
      setLastMessage(data);
    });

    // Realtime event triggers for notifications and workspace updates
    socketInstance.on('notification:new', (data) => {
      console.log('[WebSocket] ⚡ Realtime notification received (notification:new):', data);
      refreshNotifications();
    });

    socketInstance.on('notification', (data) => {
      console.log('[WebSocket] ⚡ Realtime notification received (notification):', data);
      refreshNotifications();
    });

    socketInstance.on('workspace-update', () => {
      console.log('[WebSocket] ⚡ Workspace updated');
      refreshWorkspaces();
    });

    socketInstance.on('board-update', () => {
      console.log('[WebSocket] ⚡ Board updated');
      refreshBoards();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
