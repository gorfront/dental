import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to Express backend
        const socketIo = io('http://localhost:4000');
        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    return socket;
};
