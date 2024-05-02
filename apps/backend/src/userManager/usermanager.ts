import { WebSocket } from "ws";
import { User } from "../user/user";

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
    console.log(`${userId} just now established a connection `);
    const user = new User(userId, ws);
    this.users.set(userId, user);

    ws.on("close", () => {
      console.log(`connections is closed `);
      user.close();
      this.users.delete(userId);
    });
  }
}
