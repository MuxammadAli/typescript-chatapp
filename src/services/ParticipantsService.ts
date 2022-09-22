import { getCustomRepository, In, Not } from "typeorm";
import { ParticipantRole, ParticipantState } from "../database/enums/participants";
import { Participant } from "../entities/Participant";
import { AppError } from "../errors/AppError";
import { ParticipantsRepository } from "../repositories/ParticipantsRepository";
import { Time } from "../utils/time";
import { NotificationsService } from "./NotificationsService";


interface INewParticipant {
    user_id: string;
    role?: ParticipantRole;
}



class ParticipantsService {

    async index(userID: string) {
        try {
          const participantsRepository = getCustomRepository(
            ParticipantsRepository
          );
          const participant = await participantsRepository.findOne({
            where: [{ user_id: userID}],
            cache: new Time().timeToMS(1, "hour"),
          });
    
          if (!participant) {
            throw new Error("Participant not found");
          }
    
          return participant;
        } catch (error) {
          new Error(error);
        }
    }


    async new({user_id, role }: INewParticipant) {
        const participantsRepository = getCustomRepository(ParticipantsRepository);
        const existsParticipant = await participantsRepository.findOne({user_id});
    
        if (existsParticipant) {
    
          if (existsParticipant.state === ParticipantState.BANNED) {
            return new Error("Participant banned")
          }
    
          await participantsRepository.update(existsParticipant.id, {
            state: ParticipantState.JOINED
          })
    
          existsParticipant.state = ParticipantState.JOINED
          return existsParticipant;
        }
    
        const createdParticipant = participantsRepository.create({
          user_id,
          role: role || ParticipantRole.PARTICIPANT,
          state: ParticipantState.JOINED
        });
    
        await participantsRepository.save(createdParticipant);
        const participant = await participantsRepository.findOne(
          createdParticipant.id,
          {
            relations: ["user"],
          }
        );
        return participant;
      }
}


export { ParticipantsService }