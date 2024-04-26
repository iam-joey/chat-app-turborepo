import { WebSocket } from "ws";
import { envVariables } from "../utils/env";
import { RedisInstance } from "../redismanager";
import { User } from "../manager/manager";

export class UserManager {
  private static instance: UserManager;
  private users: Map<string, User>;
  private constructor() {
    this.users = new Map<string, User>();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  manageUser(userId: string, ws: WebSocket) {
    console.log(`${userId} just now established a connection`);
    const user = new User(userId, ws);
    this.users.set(userId, user);

    ws.on("close", () => {
      user.delete();
    });
  }
}
