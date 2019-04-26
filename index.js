const Botkit = require('botkit');

const {
    getlobbies,
    getOnelobby,
    createLobby
} = require('./lobby/lobby-router');


if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
} else {
    console.log('Good job, you have the variables!')
}


const mongodbStorage = require('./phe-storage-mongoose/index.js')({
    mongoUri: process.env.MONGODB,
});


const controller = Botkit.slackbot({
    storage: mongodbStorage,
    debug: true,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
});


controller.configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    scopes: ['commands', 'bot', 'incoming-webhook'],
});

const bot = controller.spawn({
    token: process.env.BOT_TOKEN,
    incoming_webhook: {
        url: process.env.SLACK_WEBHOOK
    }
}).startRTM();

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


//When user types 'hi', bot says 'Hello'.
controller.hears('hi', 'direct_message', function (bot, message) {
    bot.reply(message, 'Hello.');
});

controller.hears('I am hungry', 'direct_message', (bot, message) => {
    bot.reply(message, 'Haha no food for you!');
})

//All slash command responses. TO DO: we probably should cut this and throw it into a separate folder for
//tidiness.
controller.on('slash_command', async (bot, message) => {
    bot.replyAcknowledge();
    //TO DO: Put json objects to separate file for tidiness
    const showdown = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "SHOW DOWN."
            }
        },
        {
            "type": "image",
            "title": {
                "type": "plain_text",
                "text": "All cards revealed!",
                "emoji": true
            },
            "image_url": "https://i.imgur.com/ceTQ9vF.jpg",
            "alt_text": "All cards revealed! "
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Your Best Combo:*\n Stephanie : *TWO PAIRS*"
            },
            "accessory": {
                "type": "image",
                "image_url": "https://i.imgur.com/rqxxJsZ.jpg",
                "alt_text": "computer thumbnail"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Game Over!* Stephanie has lost the game to Noah, who had *ROYAL FLUSH* !"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "Until the next game! :smile: :beer:",
                "emoji": true
            }
        }
    ];

    //Separate bot2 is needed to respond to all slash commands!
    //I'm not sure why either, but without it bot doesnt send messages back.
    const bot2 = controller.spawn({
        token: process.env.BOT_TOKEN,
        incoming_webhook: {
            url: process.env.SLACK_WEBHOOK
        }
    });

    switch (message.command) {
        case '/talk':
            bot.reply(message, 'Sup. Slash commands are now working.');
            break;
        case '/results':
            //bot.reply(message, showdown);
            bot2.sendWebhook({
                blocks: showdown,
                channel: 'CHBAGGM4Y',
            }, function (err, res) {
                if (err) {
                    console.log(err);
                }
            });
            break;

        case '/get-lobby':
            const all_lobbies = await getlobbies();
            console.log(all_lobbies);
            if (all_lobbies.length === 0) {
                bot2.reply(message, 'There are no available lobbies recorded in database.');
            }
            else {
                bot2.reply(message, `There are currently ${all_lobbies.length} lobbies available...which one do you want to join?`);
                //TO DO - handle if lobby pops up...
                //TO DO - replace "reply" with the conversation methods.
            }
            break;

        case '/lobby':
            //makes new lobby!

            const newlobby = await createLobby({
                //TO DO - need the slash command to handle lobby names instead of hard coding!
                name: message.text,
            });

            console.log(newlobby);
            bot2.reply(message, `New lobby [${newlobby.name}] created! Currently has [${newlobby.currentPlayers}] players...`);
            break;

        default:
            bot.reply(message, 'What command is that');
    }
})

