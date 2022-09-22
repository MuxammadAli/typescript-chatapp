import { getCustomRepository } from "typeorm";
import { io, ISocketAuthenticated } from ".";
import { ParticipantStatus } from "../database/enums/participants";
import { Participant } from "../entities/Participant";
import { ParticipantsRepository } from "../repositories/ParticipantsRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import { MessagesService } from "../services/MessagesService";
import { NotificationsService } from "../services/NotificationsService";
import { ParticipantsService } from "../services/ParticipantsService";

io.on("connection", async (socket: ISocketAuthenticated) => {
    const notificationsService = new NotificationsService();
    const participantsService = new ParticipantsService();
    const messagesService = new MessagesService();

    const userID = socket.userID;
    let participant: Participant;
   
  
    socket.on("connect_in_chat", async (id: string) => {
      await socket.join(id);
      const participantsRepository = getCustomRepository(ParticipantsRepository);
      participant = await participantsService.index(socket.userID, );
  
      if (participant) {
        await participantsRepository.update(participant.id, {
          status: ParticipantStatus.ONLINE,
        });
      }
  
      socket.emit("new_user_online", userID);
  
      console.log(`Socket ${socket.id}  ${id}`);
    });

    socket.on("leave_chat", async () => {
        if (participant) {
            const participantsRepository = getCustomRepository(
              ParticipantsRepository
            );
      
            participantsRepository.update(participant.id, {
              status: ParticipantStatus.OFFLINE,
            });
          }

          socket.emit("new_user_offline", userID)
    })

    
    socket.on(
        "new_user_message",
        async (data: { message: string; reply_to_id: string; localReference: string }) => {
          const createdMessage = await messagesService.create({
            author_id: socket.userID,
            message: data.message,
            reply_to_id: data.reply_to_id
          });
    
          socket.emit("sended_user_message", {
            msg: createdMessage,
            localReference: data.localReference,
          });
          socket.emit("new_user_message", createdMessage);
    
          await notificationsService.send({
            tokens: await messagesService.getNotificationsTokens(userID),
            data: {
              id: createdMessage.id,
              message: createdMessage.message,
              author: createdMessage.author,
              created_at: createdMessage.created_at,
            },
            channelId: "messages",
            categoryId: "message",
            message: {
              content: {
                body: `💬 ${createdMessage.author.name}: ${createdMessage.message}`,
              },
            },
          });
        }
    );


    socket.on("new_message_with_files", async (data) => {
        const newMessageWithFiles = await messagesService.getMessageWithFiles({
            author_id: userID,
            message_id: data.message_id,
            message: data.message
        })

        socket.emit("sended_user_message", {
            msg: newMessageWithFiles,
            localReference: data.localReference,
        });
        socket.emit("new_user_message", newMessageWithFiles);

        await notificationsService.send({
            tokens: await messagesService.getNotificationsTokens(userID, {
                getOnlines: false,
            }),
            data:{
                id: newMessageWithFiles.id,
                message: newMessageWithFiles.message,
                files: newMessageWithFiles.files,
                author: newMessageWithFiles.author,
                created_at: newMessageWithFiles.created_at,
            },
            channelId: "messages",
            message: {
                content: {
                    body: `📂 ${newMessageWithFiles.author.name}: ${newMessageWithFiles.message}`,
                },
            },
        });
    });

    socket.on("add_user_typing", async ({typing}) => {
        const userRepository = getCustomRepository(UsersRepository)
        const user = await userRepository.findOne(userID)

        socket.emit("new_user_typing", user)
    });


    socket.on("remove_user_typing", async ({ typing, user_id }) => {
        socket.emit("delete_user_typing", userID)
    });

    
    socket.on("set_read_message", async (messageID: string) => {
        await messagesService.readMessage(messageID, userID)
    });

    socket.on("delete_user_message", async (messageID: string) => {
        const result = await messagesService.delete(messageID, userID);
        socket.emit("delete_user_message", result)
    })
})