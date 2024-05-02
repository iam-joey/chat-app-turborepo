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
  Leave = "LEAVE",
  Received = "RECEIVED_MESSAGE",
  Notify = "NOTIFICATION_MESSAGE",
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
    }
  | {
      type: SupportedMessages.Leave;
      payload: leaveType;
    };

export type OutGoingMessage =
  | {
      type: SupportedMessages.Received;
      payload: ReceivedMessage;
    }
  | {
      type: SupportedMessages.Notify;
      payload: NotifyMessage;
    }
  | {
      type: SupportedMessages.UpvoteMessage;
      payload: MessageVotesSchemaType;
    }
  | {
      type: SupportedMessages.DownVoteMessage;
      payload: MessageVotesSchemaType;
    };

const joinMessage = z.object({
  roomId: z.string(),
});

export type JoinMessageType = z.infer<typeof joinMessage>;

const sendMessage = z.object({
  message: z.string(),
  roomId: z.string(),
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

const leave = z.object({
  roomId: z.string(),
});

export type leaveType = z.infer<typeof leave>;

const receivedMessage = z.object({
  message: z.string(),
  messageId: z.string(),
  senderId: z.string(),
});

const notifyMessage = z.object({
  message: z.string(),
});

export type NotifyMessage = z.infer<typeof notifyMessage>;

export type ReceivedMessage = z.infer<typeof receivedMessage>;

const MessageVotesSchema = z.record(
  z.object({
    UP_VOTES: z.array(z.string()),
    DOWN_VOTES: z.array(z.string()),
  })
);

export type MessageVotesSchemaType = z.infer<typeof MessageVotesSchema>;
