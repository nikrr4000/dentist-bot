import notificator from "#helpers/notificator.js";

//FIXME, here was pino but it returned error "has no callable signature"
const logger = {
    "fatal": (text: string) => logFunc(text),
    "error": (text: string) => logFunc(text),
    "warn": (text: string) => logFunc(text),
    "info": (text: string) => logFunc(text),
    "debug": (text: string) => logFunc(text),
    "trace": (text: string) => logFunc(text),
}

const logFunc = (text: string) => {
    notificator.sendInfoMsg('info', text)
    console.log(text)
}

export default logger;