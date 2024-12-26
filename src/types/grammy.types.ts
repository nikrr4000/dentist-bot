import type { InlineKeyboardMarkup } from "grammy/types";
import type { Filter } from "grammy";
import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context, SessionFlavor } from "grammy";
import type { FileFlavor } from "@grammyjs/files";

export type MyContext = FileFlavor<
  Context &
  SessionFlavor<SessionData> &
  ConversationFlavor & {
    userId: number;
    chatId: number;
  }
>;
export type MyConversation = Conversation<MyContext>;
export interface SessionData {
  user: TelegramUser;
  temp: {
    apptNumber: number;
  };
  routeHistory: Array<routeHistoryUnit>; // Укажите тип элементов, если это строки, или другой тип, если необходимо
  lastMsgId: number;
  editMode: boolean;
  conversation: object;
}
export type CallbackCtx = Filter<MyContext, "callback_query">;

export interface TelegramUser {
  firstName: string;
  secondName: string;
}

export interface routeHistoryUnit {
  text: string;
  reply_markup: InlineKeyboardMarkup;
}
