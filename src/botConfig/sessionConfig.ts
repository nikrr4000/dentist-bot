import type { SessionData } from "#types/grammy.types.js";

const initialConfig: SessionData = {
  user: {
    firstName: "",
    secondName: "",
  },
  temp: {
    apptNumber: 0,
  },
  routeHistory: [],
  lastMsgId: 0,
  editMode: true,
  conversation: {},
};

export default initialConfig;
