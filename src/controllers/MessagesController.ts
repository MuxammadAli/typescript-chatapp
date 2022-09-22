import { Response, Request } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { RequestAuthenticated } from "../middlewares/authProvider";
import { MessagesRepository } from "../repositories/MessagesRepository";
import { StorageManager } from "../services/StorageManager";
import { FilesRepository } from "../repositories/FilesRepository";
import { ReadMessagesRepository } from "../repositories/ReadMessagesRepository";
import { ParticipantsRepository } from "../repositories/ParticipantsRepository";


class MessagesController {

    async list(req: RequestAuthenticated, res:Response){
        const { _limit, _page } = req.query

        const participantsRepository = getCustomRepository(ParticipantsRepository)
        const messagesRepository = getCustomRepository(MessagesRepository)
        const readMessagesRepository = getCustomRepository(ReadMessagesRepository)

        const participant = await participantsRepository.findOne({
            where: { user_id: req.userId },
            cache: 50000
        });

        if(!participant){
            throw new AppError("Participant not found", 404)
        }


        const messages = await messagesRepository.find({
            relations: [
                "author",
                "author.avatar",
                "reply_to",
                "reply_to.author"
            ],
            take: Number(_limit),
            skip: Number(_page) * Number(_limit),
            order: { created_at: "DESC"}
        })

        Promise.all(
            messages.map(async (message) => {
                const isRead = await readMessagesRepository.findOne({
                    where: { message_id: message.id, user_id: req.userId},
                })

                if(!isRead){
                    const newMessageRead = readMessagesRepository.create({
                        message_id: message.id,
                        user_id: req.userId
                    })
                    await readMessagesRepository.save(newMessageRead)
                }
            })
        );
        return res.status(200).json({ messages })
    }


    async createAttachment(req: RequestAuthenticated, res: Response){
        const body = req.body
        const storage = new StorageManager()

        const messageRepository = getCustomRepository(MessagesRepository)
        const filesReposotory = getCustomRepository(FilesRepository)
        const participantsRepository = getCustomRepository(ParticipantsRepository)

        const attachType = String(req.query.type);


        const participant = await participantsRepository.findOne({
            where: {user_id: req.userId},
            cache: 50000
        });

        if(!participant){
            throw new AppError("Participant not found", 404)
        }

                        
        else if(attachType === "files"){
            const createdMessage = messageRepository.create({
                author_id: req.userId,
                message: body.message,
                participant_id: participant.id,
                reply_to_id: body.reply_to_id
            });

            await messageRepository.save(createdMessage);

            const files = req.files as Express.Multer.File[];
            const uploadedFiles = await storage.uploadMultipleFiles({files})

            const savedFiles = await Promise.all(
                uploadedFiles.map(async (uFile) => {
                    if(uFile) {
                        const createFile = filesReposotory.create({
                            ...uFile,
                            user_id: req.userId,
                            message_id: createdMessage.id
                        });

                        await filesReposotory.save(createFile)
                        return createFile;
                    }
                })
            )

            return res.json({ files: savedFiles, message_id: createdMessage.id})
        }
    }
}

export { MessagesController }