import { WebSocket } from "ws";
import { envVariables } from "../utils/env";
import { RedisInstance } from "../redismanager";

const redis_uri = envVariables.REDIS_URI;
const redis = RedisInstance.getInstance(redis_uri);

export class UserManager {
  private static instance: UserManager;
  private users: Map<string, string[]>;
  private constructor() {
    this.users = new Map<string, string[]>();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  addUser(userId: string, roomId: string, ws: WebSocket) {
    if (!this.users.get(userId)) {
      this.users.set(userId, []);
    }
    const rooms = this.users.get(userId) as string[];
    if (!rooms?.includes(roomId)) {
      rooms?.push(roomId);
      this.users.set(userId, rooms);
    }
    this.eventHandlers(ws, userId, roomId);
  }

  private eventHandlers(ws: WebSocket, userId: string, roomId: string) {
    ws.on("close", async () => {
      await redis.removeFromRedisAfterUserLeft(roomId, userId);
      console.log(`user id ${userId} left ${roomId}`);
    });
  }
}
