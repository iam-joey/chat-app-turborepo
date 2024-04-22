import { WebSocket } from "ws";
import { RedisInstance } from "../redismanager";
import { envVariables } from "../utils/env";
import {
  IncomingMessage,
  JoinMessageType,
  SendMessageType,
  SupportedMessages,
} from "../types";

const redis_uri = envVariables.REDIS_URI;
const redis = RedisInstance.getInstance(redis_uri);

export class WebSocketManager {
  private static instance: WebSocketManager;

  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    return this.instance;
  }

  manageUser(ws: WebSocket) {
    //here create the user while join
    ws.on("message", async (message) => {
      this.handleMessage(message, ws);
    });
  }

  async handleMessage(message: any, ws: WebSocket) {
    const parsedMessage: IncomingMessage = JSON.parse(message);
    console.log(parsedMessage);
    switch (parsedMessage.type) {
      case SupportedMessages.JoinRoom:
        const joinMessage = parsedMessage.payload as JoinMessageType;
        console.log("inside", joinMessage);
        await redis.storeInRedis(joinMessage.roomId, joinMessage.userId, ws);
        console.log("after redis store");
        break;
      case SupportedMessages.SendMessage:
        const sendMessage = parsedMessage.payload as SendMessageType;
        await redis.publishToRoom(
          sendMessage.roomId,
          sendMessage.message,
          sendMessage.userId
        );
        break;
    }
  }
}
