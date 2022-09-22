import { Server, Socket } from "socket.io";
import { http } from "../https";

interface ISocketAuthenticated extends Socket {
  userID?: string;
}

const io = new Server(http, {
  cors: {
    optionsSuccessStatus: 200,
    credentials: true,
  },
});

io.use((socket: ISocketAuthenticated, _next) => {
  const token = socket.handshake.query.token;
  
});

export { io, ISocketAuthenticated };