import { admin } from "#root/bot.js";
import config from "#root/config.js";
import type { InlineKeyboard } from "grammy";

type topicsListT = "error" | "record" | "info"
type topicsT = {
    [key in topicsListT]: number;
};

class notificator {
    private serviceGroupId: number;
    private topics: topicsT;
    private adminIds: number[];

    constructor() {
        this.serviceGroupId = +config.SERVICE_GROUP_ID;
        this.topics = {
            error: +config.ERROR_TOPIC,
            record: +config.NEW_RECORDS_TOPIC,
            info: +config.INFO_TOPIC
        }
        this.adminIds = config.ADMIN_IDS.split("|").map(Number);
    }
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

    async sendInfoMsg(type: topicsListT, msg: string) {
        return admin.sendMessage(this.serviceGroupId, msg, {
            message_thread_id: this.topics[type]
        })
    }
}

export default new notificator();
