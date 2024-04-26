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

  private constructor(url: string) {
    this.subscriber = new Redis(url);
    this.publisher = new Redis(url);
    this.userRooms = new Map();
    this.roomUsers = new Map();
    this.subscribedRooms = new Set();
    this.roomMessageHandlers = new Map();
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
    if (users) {
      Object.values(users).forEach((user) => user.connection.send(message));
    }
  }

  public publishToRoom(roomId: string, message: string) {
    this.publisher.publish(roomId, message);
  }

  public removeFromRedisAfterUserLeft(userId: string) {
    const userRooms = this.userRooms.get(userId); //["123","2313"]
    if (userRooms) {
      userRooms.forEach((roomId) => {
        const usersInRoom = this.roomUsers.get(roomId);
        if (usersInRoom) {
          delete usersInRoom[userId];
          if (Object.keys(usersInRoom).length === 0) {
            this.subscriber.unsubscribe(roomId);
            const handler = this.roomMessageHandlers.get(roomId);
            if (handler) {
              this.subscriber.removeListener("message", handler);
              this.roomMessageHandlers.delete(roomId);
            }
            this.subscribedRooms.delete(roomId);
          }
        }
      });
      this.userRooms.delete(userId);
    }
  }
}
