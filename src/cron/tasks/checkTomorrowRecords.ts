import apptCtrl from "#db/handlers/apptCtrl.js";
import notificator from "#helpers/notificator.js";
import { recordServices } from "#helpers/index.js";

export default {
    expression: '0 0 19 * * *',
    task: async () => {
        const tomorrowAppt = await apptCtrl.findTomorrowAppt();
        if (tomorrowAppt)
        {
            try
            {

                await recordServices.notificateAboutAppt(tomorrowAppt.id)
                await notificator.sendInfoMsg('info', 'Была создана рассылка для подтверждения записи.')
            } catch (error)
            {
                notificator.sendInfoMsg('error', `Во время попытки создать рассылку для подтверждения записи произошла ошибка:\n\n${error}`)
            }
        }
    }
}