//FIXME, here was pino but it returned error "has no callable signature"
const logger = {
    "fatal": (text: string) => console.log(text),
    "error": (text: string) => console.log(text),
    "warn": (text: string) => console.log(text),
    "info": (text: string) => console.log(text),
    "debug": (text: string) => console.log(text),
    "trace": (text: string) => console.log(text),
}
export default logger;

