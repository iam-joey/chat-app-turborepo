import {
  downVoteType,
  IncomingMessage,
  JoinMessageType,
  SendMessageType,
  SupportedMessages,
  upVoteType,
  OutGoingMessage,
} from "@repo/common/types";
import { WebSocket } from "ws";
import { RedisInstance } from "../redismanager";
import { envVariables } from "../utils/env";
import { DatabaseManager } from "../dbManager/dbmanager";

const redis_uri = envVariables.REDIS_URI;
const redis = RedisInstance.getInstance(redis_uri);

export class User {
  private userId: string;
  private ws: WebSocket;
  private userRooms: string[];

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
        if (!this.userRooms.includes(joinMessage.roomId)) {
          this.userRooms.push(joinMessage.roomId);
        }
        const data = await DatabaseManager.getInstance().addRoomIdInUsersDB(
          joinMessage.roomId,
          this.userId
        );
        if (!data) {
          this.notify("Not able to join the room");
          return;
        }
        await redis.storeInRedis(joinMessage.roomId, this.userId, this.ws);
        await redis.publishToRoom(
          joinMessage.roomId,
          JSON.stringify({
            type: SupportedMessages.Notify,
            payload: {
              message: `${this.userId} joined `,
            },
          })
        );
        this.notify(`Joined successfully to ${joinMessage.roomId}`);
        break;
      case SupportedMessages.SendMessage:
        const sendMessage = parsedMessage.payload as SendMessageType;
        if (!this.userRooms.includes(sendMessage.roomId)) {
          this.notify("You have not joined the room to send message");
          return;
        }
        const message = await DatabaseManager.getInstance().createMessage(
          sendMessage.message,
          this.userId,
          sendMessage.roomId
        );
        redis.createEntryForVote(message.id, message.roomId);
        redis.publishToRoom(
          sendMessage.roomId,
          JSON.stringify({
            type: SupportedMessages.Received,
            payload: {
              message: message.content,
              senderId: message.senderId,
              messageId: message.id,
            },
          })
        );
        break;
      case SupportedMessages.UpvoteMessage:
        const upVote = parsedMessage.payload as upVoteType;
        if (!this.userRooms.includes(upVote.roomId)) {
          this.notify("you've not joined the room");
          return;
        }
        await redis.voteForMessage(
          upVote.messageId,
          upVote.roomId,
          SupportedMessages.UpvoteMessage,
          this.userId
        );
        break;
      case SupportedMessages.DownVoteMessage:
        const downVote = parsedMessage.payload as downVoteType;
        if (!this.userRooms.includes(downVote.roomId)) {
          this.notify("you've not joined the room");
          return;
        }
        await redis.voteForMessage(
          downVote.messageId,
          downVote.roomId,
          SupportedMessages.DownVoteMessage,
          this.userId
        );
        break;
      default:
        this.notify("Don't send stupid req");
        break;
    }
  }

  notify(message: string) {
    this.ws.send(
      JSON.stringify({
        type: SupportedMessages.Notify,
        payload: {
          message,
        },
      })
    );
  }

  async close() {
    await redis.removeFromRedisAfterUserLeft(this.userId);
  }
}
