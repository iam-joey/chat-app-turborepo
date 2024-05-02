import { RoomRepo } from "../repository";

export default class RoomService {
  private roomRepo: RoomRepo;
  constructor() {
    this.roomRepo = new RoomRepo();
  }

  async createRoom(id: string) {
    try {
      const room = await this.roomRepo.generateRoom(id);
      return room;
    } catch (error) {
      throw error;
    }
  }
}
