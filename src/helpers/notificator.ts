import errorHandler from "#handlers/logErrorAndThrow.js";
import { admin } from "#root/bot.js";
import sanitizedConfig from "#root/config.js";
import logger from "#root/logger.js";
import type { MyContext } from "#types/grammy.types.js";
import type { InlineKeyboard } from "grammy";

class notificator {
    serviceGroupId: number;
    //   serviceTopics: {
    //     subTopic: number;
    //     feedbackTopic: number;
    //   };
    adminIds: number[];

    constructor() {
        this.serviceGroupId = +sanitizedConfig.SERVICE_GROUP_ID;
        // this.serviceTopics = {
        //   subTopic: +sanitizedConfig.SUB_TOPIC,
        //   feedbackTopic: +sanitizedConfig.FEEDBACK_TOPIC,
        // };
        this.adminIds = sanitizedConfig.ADMIN_IDS.split("|").map(Number);
    }

    //   async newFeedback(feedback: string) {
    //     admin.sendMessage(this.serviceGroupId, feedback, {
    //       message_thread_id: this.serviceTopics.feedbackTopic,
    //     });
    //   }

    async sendMessageById(
        text: string,
        userId: number,
        replyMarkup?: InlineKeyboard
    ) {
        return admin.sendMessage(userId, text, {
            reply_markup: replyMarkup,
            parse_mode: "HTML",
        });
    }

    async sendBulkMessages(
        text: string,
        userIds: number[],
        replyMarkup?: InlineKeyboard
    ) {
        const messPromises = userIds.map((id) =>
            this.sendMessageById(text, id, replyMarkup)
        );
        return Promise.all(messPromises);
    }
}

export default new notificator();
