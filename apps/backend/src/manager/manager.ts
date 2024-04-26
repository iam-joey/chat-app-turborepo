import {
  IncomingMessage,
  JoinMessageType,
  leaveType,
  SendMessageType,
  SupportedMessages,
} from "@repo/common/types";
import { WebSocket } from "ws";
import { RedisInstance } from "../redismanager";
import { envVariables } from "../utils/env";

const redis_uri = envVariables.REDIS_URI;
const redis = RedisInstance.getInstance(redis_uri);

export class User {
  userId: string;
  ws: WebSocket;
  userRooms: string[];

  constructor(userId: string, ws: WebSocket) {
    this.userId = userId;
    this.ws = ws;
    this.userRooms = [];
    this.intitializeHandlers();
  }

  private intitializeHandlers() {
    try {
      this.ws.on("message", (message) => {
        this.handleMessage(message);
      });
    } catch (error) {}
  }

  private async handleMessage(message: any) {
    const parsedMessage: IncomingMessage = JSON.parse(message);
    console.log(parsedMessage);
    switch (parsedMessage.type) {
      case SupportedMessages.JoinRoom:
        const joinMessage = parsedMessage.payload as JoinMessageType;
        console.log("inside", joinMessage);
        if (!this.userRooms.includes(joinMessage.roomId)) {
          this.userRooms.push(joinMessage.roomId);
        }
        await redis.storeInRedis(joinMessage.roomId, this.userId, this.ws);
        break;
      case SupportedMessages.SendMessage:
        const sendMessage = parsedMessage.payload as SendMessageType;
        if (!this.userRooms.includes(sendMessage.roomId)) {
          this.notify("You have not joined the room");
          return;
        }
        redis.publishToRoom(
          sendMessage.roomId,
          sendMessage.message,
          this.userId
        );
        break;
      case SupportedMessages.Leave:
        const message = parsedMessage.payload as leaveType;
        redis.removeFromRedisAfterUserLeft(message.roomId, this.userId);
        this.notify("You left");
    }
  }

  notify(message: string) {
    this.ws.send(message);
  }

  delete() {
    this.ws.on("close", () => {
      redis.removeFromRedisAfterUserLeft(this.userId);
    });
  }
}
