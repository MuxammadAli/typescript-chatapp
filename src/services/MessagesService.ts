import { getCustomRepository, In, Not } from "typeorm";
import { MessagesRepository } from "../repositories/MessagesRepository";
import * as Yup from 'yup'
import { ReadMessagesRepository } from "../repositories/ReadMessagesRepository";
import { UserNotificationsRepository } from "../repositories/UserNotificationsRepository";
import { ParticipantsRepository } from "../repositories/ParticipantsRepository";
import { Time } from "../utils/time";
import { NotificationsService } from "./NotificationsService";
import { StorageManager } from "./StorageManager";
import { ParticipantRole, ParticipantStatus, } from "../database/enums/participants";
import { ParticipantsService } from './ParticipantsService'


interface ICreateMessageProps {
    message: string;
    author_id: string;
    reply_to_id?: string;
}

interface ICreateAudioProps {
    message?: string;
    author_id: string;
    reply_to_id?: string;
}


interface IGetMessageWithFilesProps {
    message: string;
    message_id: string;
    author_id: string;
}

interface IGetNotificationsTokensOptions {
    getOnlines?: boolean;
  }


class MessagesService {
    async getNotificationsTokens( userID: string, options: IGetNotificationsTokensOptions = {}) {
        const notificationsService = new NotificationsService();
        const participantsRepository = getCustomRepository(ParticipantsRepository);

        const participantsID = await participantsRepository
          .find({
             where: {
               status: options.getOnlines
               ? In([ParticipantStatus.ONLINE, ParticipantStatus.OFFLINE])
               : Not(ParticipantStatus.ONLINE),
               user_id: Not(
               process.env.NODE_ENV === "development" ? userID : undefined
             ),
             },
            select: ["user_id"],
         })
         .then((part) => part.map((p) => p.user_id));

    const tokens = await notificationsService.getNotificationsTokens({
      usersID: participantsID,
    });

    return tokens;
    }


    async create(msgData: ICreateMessageProps) {
        const messageRepository = getCustomRepository(MessagesRepository)
        const readMessagesRepository = getCustomRepository(ReadMessagesRepository)
        const participantsService = new ParticipantsService();

        const participant = await participantsService.index(
         msgData.author_id
        );


        if (!participant) {
            throw new Error("Error on create a message for this group!");
        }

        const schema = Yup.object().shape({
            message: Yup.string().max(500),
            author_id: Yup.string().required(),
            reply_to_id: Yup.string(),
        });

       
        try {
            await schema.validate(msgData, { abortEarly: false });
          } catch (error) {
            throw new Error(error);
        }

        const newMessage = messageRepository.create({
            ...msgData,
            participant_id: participant.id,
        });

        const savedMessage = await messageRepository.save(newMessage);
        const newReadMessage = readMessagesRepository.create({
            message_id: savedMessage.id,
            user_id: savedMessage.author_id
        });

        await readMessagesRepository.save(newReadMessage);
        const message = await messageRepository.findOne(savedMessage.id, {
        relations: [
          "author",
          "author.avatar",
          "reply_to",
          "reply_to.author",
        ],
        cache: new Time().timeToMS(1, "hour"),
        });
        return message;
    }


    async getMessageWithFiles(msgData: IGetMessageWithFilesProps) {
        const messagesRepository = getCustomRepository(MessagesRepository);
    
        const completedMessage = await messagesRepository.findOne(
          msgData.message_id,
          {
            loadEagerRelations: true,
            relations: [
              "author",
              "author.avatar",
              "reply_to",
              "reply_to.author"
            ],
          }
        );

        return completedMessage;
      }


      async readMessage(messageID: string, userID: string) {
        const readMessagesRepository = getCustomRepository(ReadMessagesRepository);
        const isRead = await readMessagesRepository.findOne({
          where: { user_id: userID, message_id: messageID },
        });
    
        if (!isRead) {
          const newReadMessage = readMessagesRepository.create({
            message_id: messageID,
            user_id: userID
          });
    
          await readMessagesRepository.save(newReadMessage);
        }
      }


      async delete(messageID: string, userID: string) {
        const storage = new StorageManager();
        const messageRepository = getCustomRepository(MessagesRepository);
        const message = await messageRepository.findOne(messageID, {
          relations: ["files"],
        });
        

    
        if (
          userID !== message.author_id
        ) {
          throw new Error("Unauthorized user/role for delete message");
        }
    
        try {
          await messageRepository.delete(message.id).then(async () => {
    
            if (message.files.length > 0) {
              await Promise.all(
                message.files.map(async (file) => {
                  await storage.deleteFile(file.path);
                })
              );
            }
          });
    
          const deletedMessageData = {
            id: message.id,
            files: !message.files.length
              ? null
              : message.files.map((f) => ({
                  id: f.id,
                  name: f.name,
                  type: f.type,
                })),
          };

          return deletedMessageData;
        } catch (error) {
          throw new Error(error);
        }
      }
}


export { MessagesService }