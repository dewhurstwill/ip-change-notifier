const sgMail = require('@sendgrid/mail');

if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

sgMail.setApiKey(process.env.SENDGRID_KEY);

async function getIp() {
    console.log('');
    console.log('Fetching current IP - ' + new Date());
    return await fetch(`https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`, {
        "method": "GET"
      }).then(res => res.json());
}

const state = new Map([
    ['previousIp', '0.0.0.0']
]);

setInterval(async () => {
    const api = await getIp();
    const previousIp = state.get('previousIp');
    const isDifferent = previousIp !== api.ip;
    if (isDifferent){
        console.log('IP has changed from ' + previousIp + ' to ' + api.ip);
        state.set('previousIp', api.ip);
        sgMail.send({
            to: process.env.EMAIL_TO,
            from: process.env.EMAIL_FROM,
            subject: process.env.EMAIL_SUBJECT || 'IP Change',
            text: 'IP has changed from ' + previousIp + ' to ' + api.ip,
            html: 'IP has changed from ' + previousIp + ' to ' + api.ip
        }).then(() => {
            console.log("[SEND GRID]: Email Sent.");
        }).catch((error) => {
            console.error("[SEND GRID]: Email Send Failed.");
        });
    }
}, Number(process.env.TIMEOUT) || 5000);