import sanitizedConfig from "#root/config.js";

const checkMessageLength = (str: string) => {
  const messageLimit = 4096;
  if (str.length > messageLimit) {
    throw new Error(
      `Был передан текст превышающий ${messageLimit} символов! Его начало:\n${str.slice(0, 40)}...\n`
    );
  }
};

const userIsAdmin = (userId:number) => 	sanitizedConfig.ADMIN_IDS.split("|").map(Number).includes(userId);


export { checkMessageLength };
