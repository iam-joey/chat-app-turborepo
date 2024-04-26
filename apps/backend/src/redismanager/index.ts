import Redis from "ioredis";
import WebSocket from "ws";

let i = 0;

export class RedisInstance {
  private static instance: RedisInstance;
  private subscriber: Redis;
  private publisher: Redis;
  private userRooms: Map<string, string[]>; //userId and his rooms in present
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
  }

  private async subscribeToRoom(roomId: string, userId: string) {
    if (!this.subscribedRooms.has(roomId)) {
      await this.subscriber.subscribe(roomId, (err, count) => {
        if (err) {
          console.error(`Error subscribing to room ${roomId}: ${err}`);
        } else {
          console.log(
            ` ${userId} subscribed to  room ${roomId} because he's first`
          );
        }
      });
      await this.subscriber.on("message", (channel, message) => {
        console.log(
          "listeners in this room",
          this.subscriber.listenerCount(roomId)
        );
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

  private sendMessageToRoom(roomId: string, message: string) {
    console.log(`sending message to room ${roomId}`);
    const users = this.roomUsers.get(roomId);
    Object.keys(users!).forEach((userId) => {
      users![userId]?.connection!.send(message);
    });
  }

  public publishToRoom(roomId: string, message: string, userId: string) {
    console.log(`publishing to room ${roomId} from ${userId}`);
    console.log(
      "publishing ",
      this.subscriber.listenerCount(roomId, this.handleMessage)
    );
    this.publisher.publish(roomId, message);
  }

  public removeFromRedisAfterUserLeft(roomId: string, userId: string) {
    const userRooms = this.userRooms.get(userId); //returns specific user present in how many rooms
    console.log(userRooms);
    console.log(`${userId} present in these rooms ${userRooms}`);
    if (userRooms && userRooms.length > 0) {
      console.log("inside removing user from the room");
      const filteredRooms = userRooms.filter(
        (userRoomId) => userRoomId !== roomId
      );
      console.log(
        `user present in these rooms ${filteredRooms} after removing them from ${roomId}`
      );
      if (filteredRooms.length > 0) {
        console.log("removing user 1");
        this.userRooms.set(userId, filteredRooms);
      } else {
        console.log("removing user 2");
        this.userRooms.delete(userId);
      }
    }

    const usersInRoom = this.roomUsers.get(roomId);

    if (Object.keys(usersInRoom!).length >= 1) {
      delete usersInRoom![userId];
    }
    console.log("users in the room", usersInRoom);
    console.log("length of the room", Object.keys(usersInRoom!).length);
    if (usersInRoom && Object.keys(usersInRoom).length === 0) {
      console.log("im inside for removing");
      this.subscriber.unsubscribe(roomId);
      this.subscriber.removeListener("message", this.handleMessage);
      this.subscribedRooms.delete(roomId);
    }
    console.log("size", this.subscribedRooms.size);
  }

  public removeUserFromRedis(userId: string) {
    //first delete it from two place userRooms and roomUsers
    let rooms = this.userRooms.get(userId);
    console.log("rooms is ", rooms);
    if (!rooms) {
      return;
    }
    rooms.forEach((roomId) => {
      let roomMembers = this.roomUsers.get(roomId);
      console.log("room members", roomMembers);
      if (Object.keys(roomMembers!).length > 0) {
        if (roomMembers![userId]) {
          delete roomMembers![userId];
        }
        if (Object.keys(roomMembers!).length == 0) {
          console.log("im inside for removing");
          this.subscriber.unsubscribe(roomId);
          this.subscriber.removeListener("message", this.handleMessage);
          this.subscribedRooms.delete(roomId);
        }
      }
    });
    console.log("size", this.subscribedRooms.size);
    this.userRooms.delete(userId);
  }
}
