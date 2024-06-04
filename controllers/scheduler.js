const cron = require("node-cron");
const Pass = require('../model/dailyPass')

const schedule = async ()=>{
    cron.schedule('0 0 * * *', async () => {
      console.log('Task started at', new Date());
        try {
            await Pass.updateMany({}, { pass: 3 });
            console.log('Pass restaurer avec succee.');
        } catch (err) {
            console.error('Error:');
        }
    });
}

module.exports = {schedule}
