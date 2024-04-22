import Redis from "ioredis";
import WebSocket from "ws";

let i = 0;

export class RedisInstance {
  private static instance: RedisInstance;
  private subscriber: Redis;
  private publisher: Redis;
  private userRooms: Map<string, string[]>; //user
  private roomUsers: Map<
    string,
    { [userId: string]: { [connection: string]: WebSocket } }
  >;
  private subscribedRooms: Set<string>;

  private constructor(url: string) {
    this.subscriber = new Redis(url);
    this.subscribedRooms = new Set<string>();
    this.publisher = new Redis(url);
    this.userRooms = new Map<string, string[]>();
    this.roomUsers = new Map<
      string,
      { [userId: string]: { [connection: string]: WebSocket } }
    >();
  }

  public static getInstance(url: string): RedisInstance {
    if (!RedisInstance.instance) {
      console.log("Creating new Redis instance");
      return (RedisInstance.instance = new RedisInstance(url));
    }
    console.log("Returning Redis instance");
    return RedisInstance.instance;
  }

  public getSubscriber(): Redis {
    return this.subscriber;
  }

  public getPublisher(): Redis {
    return this.publisher;
  }

  public async storeInRedis(roomId: string, userId: string, ws: WebSocket) {
    //temp storage of users who are active
    console.log("i here");
    if (!this.userRooms.get(userId)) {
      this.userRooms.set(userId, []);
    }
    this.userRooms.set(userId, [...this.userRooms.get(userId)!, roomId]);

    if (!this.roomUsers.get(roomId)) {
      this.roomUsers.set(roomId, {});
    }
    if (!this.roomUsers.get(roomId)![userId]) {
      this.roomUsers.get(roomId)![userId] = {};
    }
    this.roomUsers.set(roomId, {
      ...this.roomUsers.get(roomId),
      [userId]: {
        connection: ws,
      },
    });

    if (!this.subscribedRooms.has(roomId)) {
      await this.subscribeToRoom(roomId, userId);
    }
    console.log("size is ", this.subscribedRooms.size);
  }

  private async subscribeToRoom(roomId: string, userId: string) {
    if (!this.subscribedRooms.has(roomId)) {
      await this.subscriber.subscribe(roomId, (err, count) => {
        if (err) {
          console.error(`Error subscribing to room ${roomId}: ${err}`);
        } else {
          console.log(`Subscribed to messages for room ${roomId}`);
        }
      });
      await this.subscriber.on("message", (channel, message) => {
        console.log(`i'm ${userId} getting triggered someone message us `);
        this.handleMessage(channel, message, roomId);
      });
      this.subscribedRooms.add(roomId);
    }
  }
  private handleMessage = (
    channel: string,
    message: string,
    roomId: string
  ) => {
    if (channel === roomId) {
      console.log(`someone sent a message to the room ${channel} ${i++}`);
      console.log(`Received message for room ${roomId}: ${message}`);
      this.sendMessageToRoom(channel, message);
    }
  };

  private handleClose = () => {
    console.log(
      "User who connected getting exited from the room make another user the host"
    );
  };

  private sendMessageToRoom(roomId: string, message: string) {
    console.log(`sending message to room ${roomId}`);
    const users = this.roomUsers.get(roomId);
    Object.keys(users!).forEach((userId) => {
      users![userId]?.connection!.send(message);
    });
  }

  public publishToRoom(roomId: string, message: string, userId: string) {
    console.log(`publishing to room ${roomId} from ${userId}`);
    this.publisher.publish(roomId, message);
  }

  public removeFromRedisAfterUserLeft(roomId: string, userId: string) {
    const userRooms = this.userRooms.get(userId);
    if (userRooms && userRooms.length > 0) {
      const filteredRooms = userRooms.filter(
        (userRoomId) => userRoomId !== roomId
      );
      if (filteredRooms.length > 0) {
        this.userRooms.set(userId, filteredRooms);
      } else {
        this.userRooms.delete(userId);
        this.publisher.unsubscribe(userId);
      }
    }

    const usersInRoom = this.roomUsers.get(roomId);
    if (usersInRoom && Object.keys(usersInRoom).length === 0) {
      this.subscriber.unsubscribe(roomId);
      this.subscriber.removeListener("message", this.handleMessage);
      this.subscribedRooms.delete(roomId);
    }
    console.log("size ", this.subscribedRooms.size);
  }
}
