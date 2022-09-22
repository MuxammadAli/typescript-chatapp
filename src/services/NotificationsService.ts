import { UserNotificationsRepository } from "../repositories/UserNotificationsRepository";
import { getCustomRepository, In } from "typeorm";
import { Time } from "../utils/time";


type SendNotificationProps = {
    tokens: string[];
    message: NotificationsBody;
    priority?: "default" | "normal" | "high";
    data?: object;
}

type NotificationsBody = {
    content: {
        body: string;
        title: string;
        
    };
};

type GetNotificationsProps = {
    usersID: string[]
};


class NotificationsService {

    async getNotificationsTokens({ usersID }: GetNotificationsProps) {
        const userNotificationsRepository = getCustomRepository(
          UserNotificationsRepository
        );
        const time = new Time();
    
        const tokens = await userNotificationsRepository
          .find({
            where: {
              user_id: In(usersID),
              is_revoked: false,
              send_notification: true,
            },
            cache: time.timeToMS(1, "hour"),
            select: ["notification_token"],
          })
          .then((tokens) => tokens.map((t) => t.notification_token));
    
        const uniqueTokens = [...new Set(tokens)];
    
        return uniqueTokens;
    }


    async send(data: SendNotificationProps) {
        const notificationTokens = data.tokens;
    const preparedMessages = [];

    notificationTokens.map((token) => {
      preparedMessages.push({
        to: token,
        ttl: 604800,
        title: data.message.content.title,
        body: data.message.content.body,
        data: data.data || {},  
        priority: data.priority || "default",
      });
    });
    }
}


export { NotificationsService }

