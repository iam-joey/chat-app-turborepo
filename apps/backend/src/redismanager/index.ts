import {
  MessageVotesSchemaType,
  NotifyMessage,
  OutGoingMessage,
  ReceivedMessage,
  SupportedMessages,
} from "@repo/common/types";
import Redis from "ioredis";
import WebSocket from "ws";

export class RedisInstance {
  private static instance: RedisInstance;
  private subscriber: Redis;
  private publisher: Redis;
  private userRooms: Map<string, string[]>; // User's rooms
  private roomUsers: Map<
    string,
    { [userId: string]: { connection: WebSocket } }
  >;
  private subscribedRooms: Set<string>;
  private roomMessageHandlers: Map<
    string,
    (channel: string, message: string) => void
  >;
  private messageVotes: Map<
    string,
    {
      [messageId: string]: {
        UP_VOTE: string[];
        DOWN_VOTE: string[];
      };
    }
  >; //roomId,message_key

  private constructor(url: string) {
    this.subscriber = new Redis(url);
    this.publisher = new Redis(url);
    this.userRooms = new Map<string, string[]>();
    this.roomUsers = new Map<
      string,
      { [userId: string]: { connection: WebSocket } }
    >();
    this.subscribedRooms = new Set<string>();
    this.roomMessageHandlers = new Map<
      string,
      (channel: string, message: string) => void
    >();
    this.messageVotes = new Map<
      string,
      {
        [messageId: string]: {
          UP_VOTE: string[];
          DOWN_VOTE: string[];
        };
      }
    >();
  }

  public static getInstance(url: string): RedisInstance {
    if (!RedisInstance.instance) {
      RedisInstance.instance = new RedisInstance(url);
    }
    console.log("redis created");
    return RedisInstance.instance;
  }

  public async storeInRedis(roomId: string, userId: string, ws: WebSocket) {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, []);
    }
    this.userRooms.get(userId)!.push(roomId);
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, {});
    }
    this.roomUsers.get(roomId)![userId] = { connection: ws };
    if (!this.subscribedRooms.has(roomId)) {
      await this.subscribeToRoom(roomId);
    }
  }

  private async subscribeToRoom(roomId: string) {
    if (!this.subscribedRooms.has(roomId)) {
      const messageHandler = (channel: string, message: string) => {
        if (channel === roomId) {
          this.sendMessageToRoom(roomId, message);
        }
      };
      await this.subscriber.subscribe(roomId);
      this.subscriber.on("message", messageHandler);
      this.subscribedRooms.add(roomId);
      this.roomMessageHandlers.set(roomId, messageHandler);
    }
  }

  private sendMessageToRoom(roomId: string, message: string) {
    const users = this.roomUsers.get(roomId);
    const msg: OutGoingMessage = JSON.parse(message) as OutGoingMessage;
    switch (msg.type) {
      case SupportedMessages.Received:
        const receivedMessage = msg.payload as ReceivedMessage;
        if (users) {
          Object.values(users).forEach((user) =>
            user.connection.send(
              JSON.stringify({
                type: SupportedMessages.Received,
                payload: receivedMessage,
              })
            )
          );
        }
        break;
      case SupportedMessages.UpvoteMessage:
        const upVoteMessage = msg.payload as MessageVotesSchemaType;
        console.log(upVoteMessage);
        if (users) {
          Object.values(users).forEach((user) =>
            user.connection.send(
              JSON.stringify({
                type: SupportedMessages.UpvoteMessage,
                payload: upVoteMessage,
              })
            )
          );
        }
        break;
      case SupportedMessages.DownVoteMessage:
        const downVoteMessage = msg.payload as MessageVotesSchemaType;
        if (users) {
          Object.values(users).forEach((user) =>
            user.connection.send(
              JSON.stringify({
                type: SupportedMessages.DownVoteMessage,
                payload: downVoteMessage,
              })
            )
          );
        }
        break;
      case SupportedMessages.Notify:
        const notify = msg.payload as NotifyMessage;
        if (users) {
          Object.values(users).forEach((user) =>
            user.connection.send(
              JSON.stringify({
                type: SupportedMessages.Notify,
                payload: notify,
              })
            )
          );
        }
        break;
      default:
        break;
    }
  }

  public async publishToRoom(roomId: string, message: string) {
    await this.publisher.publish(roomId, message);
  }

  public removeFromRedisAfterUserLeft(userId: string) {
    const userRooms = this.userRooms.get(userId); //["123","2313"]
    if (userRooms) {
      userRooms.forEach(async (roomId) => {
        const usersInRoom = this.roomUsers.get(roomId);
        if (usersInRoom) {
          delete usersInRoom[userId];
          if (Object.keys(usersInRoom).length === 0) {
            await this.subscriber.unsubscribe(roomId);
            const handler = this.roomMessageHandlers.get(roomId);
            if (handler) {
              this.subscriber.removeListener("message", handler);
              this.roomMessageHandlers.delete(roomId);
            }
            this.subscribedRooms.delete(roomId);
            this.messageVotes.delete(roomId);
          }
        }
      });
      this.userRooms.delete(userId);
    }
  }

  public createEntryForVote(messageId: string, roomId: string) {
    if (!this.messageVotes.has(roomId)) {
      this.messageVotes.set(roomId, {});
    }
    const roomVotes = this.messageVotes.get(roomId);
    roomVotes![messageId] = {
      UP_VOTE: [],
      DOWN_VOTE: [],
    };

    this.messageVotes.set(roomId, roomVotes!);
  }

  public voteForMessage(
    messageId: string,
    roomId: string,
    type: SupportedMessages.UpvoteMessage | SupportedMessages.DownVoteMessage,
    userId: string
  ) {
    const messages = this.messageVotes.get(roomId);
    if (!messages || !messages[messageId]) {
      return;
    }
    if (type == "UPVOTE_MESSAGE") {
      if (messages[messageId].DOWN_VOTE.includes(userId)) {
        messages[messageId].DOWN_VOTE = messages[messageId].DOWN_VOTE.filter(
          (removeUserId) => removeUserId !== userId
        );
      }
      if (!messages[messageId].UP_VOTE.includes(userId)) {
        messages[messageId].UP_VOTE.push(userId);
      }

      this.sendMessageToRoom(
        roomId,
        JSON.stringify({
          type: SupportedMessages.UpvoteMessage,
          payload: {
            [`${messageId}`]: messages[messageId],
          },
        })
      );
    } else if (type == "DOWNVOTE_MESSAGE") {
      if (messages[messageId].UP_VOTE.includes(userId)) {
        messages[messageId].UP_VOTE = messages[messageId].UP_VOTE.filter(
          (removeUserId) => removeUserId !== userId
        );
      }
      if (!messages[messageId].DOWN_VOTE.includes(userId)) {
        messages[messageId].DOWN_VOTE.push(userId);
      }
      this.sendMessageToRoom(
        roomId,
        JSON.stringify({
          type: SupportedMessages.DownVoteMessage,
          payload: {
            [`${messageId}`]: messages[messageId],
          },
        })
      );
    }
    this.messageVotes.set(roomId, messages);
  }
}
