//----------------------------------------
/*              Import                  */
const Botkit = require('botkit');

const {
    handleSlash
} = require('./slash-commands')

const joinPokerEventListener = require('./bot-skills/poker-commands.js');



//----------------------------------------
/*      Authentication checkpoint       */
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
} else {
    console.log('Good job, you have the variables!')
}
//----------------------------------------
/*          MongoDB storage             */
const mongodbStorage = require('./phe-storage-mongoose/index.js')({
    mongoUri: process.env.MONGODB,
});
//----------------------------------------
/*      Controller, the Slackbot        */
const controller = Botkit.slackbot({
    storage: mongodbStorage,
    debug: false,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
});
//----------------------------------------
/*        Configure Controller          */
controller.configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    scopes: ['commands', 'bot', 'incoming-webhook'],
});
//----------------------------------------
/*      Spawns "bot" from Controller    */
const bot = controller.spawn({
    token: process.env.BOT_TOKEN,
    incoming_webhook: {
        url: process.env.SLACK_WEBHOOK
    }
}).startRTM();
//----------------------------------------
/*          Webhook setup               */
controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);
    controller.createOauthEndpoints(controller.webserver,
        function (err, req, res) {
            if (err) {
                res.status(500).send('ERROR: ' + err);
            } else {
                res.send('Success!');
            }
        });
});


//---- Test zone ---------------------------------------------------------------------//
controller.hears('hi', 'direct_message', function (bot, message) {
    bot.reply(message, 'Hello.');
});

controller.hears('I am hungry', 'direct_message', (bot, message) => {
    bot.reply(message, 'Haha no food for you!');
})
//------------------------------------------------------------------------------------//

//----------------------------------------
/*   Bot listens to keyword in Slack    */
joinPokerEventListener(controller);


//----------------------------------------
/*        Slash Command handling        */
controller.on('slash_command', async (bot, message) => {
    bot.replyAcknowledge();
    //TO DO: Put json objects to separate file for tidiness
    handleSlash(bot, message);
})

//----------------------------------------