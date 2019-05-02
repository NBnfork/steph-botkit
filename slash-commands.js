const {
    getlobbies,
    getOnelobby,
    createLobby,
    //updateLobby,
    addPlayer,
    deleteLobbyAll
} = require('./lobby/lobby-router');

const message_blocks = require('./message-blocks/poker-messages');
// ------- Assign selected message blocks to local const ----------- //
const showdown = message_blocks.showdown_mockup;

//-------------------------------------------------------------------//

// const bot2 = controller.spawn({
//     token: process.env.BOT_TOKEN,
//     incoming_webhook: {
//         url: process.env.SLACK_WEBHOOK
//     }
// });


const handleSlash = async (bot, message) => {
    //Separate bot2 is needed to respond to all slash commands!
    //I'm not sure why either, but without it bot doesnt send messages back.

    // #debug --------------------------------------------
    console.log("\n\nslash-commands.js / handleSlash (): ----------------------");
    console.log(message.command);
    //----------------------------------------------------

    switch (message.command) {
        case '/talk':
            bot.reply(message, 'Sup. Slash commands are now working.');
            break;

        case '/results':
            bot.sendWebhook({
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
            //console.log(all_lobbies);
            if (all_lobbies.length === 0) {
                bot.reply(message, 'There are no available lobbies recorded in database.');
            }
            else {
                bot.reply(message, `There are currently ${all_lobbies.length} lobbies available...which one do you want to join?`);
                //TO DO - handle if lobby pops up...
                //TO DO - replace "reply" with the conversation methods.
            }
            break;

        case '/make-lobby':
            //makes new lobby!

            const newlobby = await createLobby({
                name: message.text,
                // -------- Optional data to init ------------ 
                // maxPlayers : ,
                currentPlayers: 1,
                playerList: [message.user_id],
                // buyin :
                // -------------------------------------------
            });

            //console.log(newlobby);
            bot.reply(message, `New lobby [${newlobby.name}] created! Currently has [${newlobby.currentPlayers}] players...`);
            break;

        case '/join-lobby':
            // joins a specified lobby by name
            const lobby_name = message.text;
            const user_id = message.user_id;
            const thisLobby = addPlayer(user_id, lobby_name);



            // #Debug -------------------------------------
            // console.log(message);
            //---------------------------------------------

            break;

        case '/clear_lob':
            // deletes all lobbies
            const deletedLobbies = await deleteLobbyAll();
            bot.reply(message, `Debug: All lobbies have been deleted from the database.`);
            break;

        default:
            bot.reply(message, 'What command is that');
    }
}

module.exports = {
    handleSlash
};