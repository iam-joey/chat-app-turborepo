import { z } from "zod";

/*

    {
        type:"JOIN",
        payload:{
            roomId:"blahblah",
            userId:"1234"
        }
    }

    {
        type:"SEND_MESSAGE",
        payload:{
            message:"Why?"
            roomID:"1231",
            userId:"1234"
        }
    }

    {
        type:"UpVote_message",
        payload:{
            messgaID:"asdasdasd",
            roomId:"blahblah"
        }
    }

    {
        type:DownVote_message,
        payload:{
            messageID:"asdasda",
        }
    }
*/
export enum SupportedMessages {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGE",
  UpvoteMessage = "UPVOTE_MESSAGE",
  DownVoteMessage = "DOWNVOTE_MESSAGE",
}

export type IncomingMessage =
  | {
      type: SupportedMessages.JoinRoom;
      payload: JoinMessageType;
    }
  | {
      type: SupportedMessages.SendMessage;
      payload: SendMessageType;
    }
  | {
      type: SupportedMessages.UpvoteMessage;
      payload: upVoteType;
    }
  | {
      type: SupportedMessages.DownVoteMessage;
      payload: downVoteType;
    };

const joinMessage = z.object({
  roomId: z.string(),
  userId: z.string(),
});

export type JoinMessageType = z.infer<typeof joinMessage>;

const sendMessage = z.object({
  message: z.string(),
  roomId: z.string(),
  userId: z.string(),
});

export type SendMessageType = z.infer<typeof sendMessage>;

const upVote = z.object({
  messageId: z.string(),
  roomId: z.string(),
});

export type upVoteType = z.infer<typeof upVote>;

const downVote = z.object({
  messageId: z.string(),
  roomId: z.string(),
});

export type downVoteType = z.infer<typeof downVote>;
