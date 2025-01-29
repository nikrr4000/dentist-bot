import apptCtrl from "#db/handlers/apptCtrl.js";
import { recordServices } from "#helpers/recordsUtils.js";

export default {
    expression: '0 0 19 * * *',
    task: async () => {
        const tomorrowAppt = await apptCtrl.findTomorrowAppt();
        if (tomorrowAppt)
        {
            recordServices.notificateAboutAppt(tomorrowAppt.id)
        }
    }
}