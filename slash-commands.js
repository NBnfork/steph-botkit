const {
    getlobbies,
    getOneLobby,
    createLobby,
    addPlayer,
    deleteLobbyAll
} = require('./lobby/lobby-router');

const message_blocks = require('./message-blocks/poker-messages');
// ------- Assign selected message blocks to local const ----------- //
const showdown = message_blocks.showdown_mockup;

//-------------------------------------------------------------------//

const handleSlash = async (bot, message) => {
    // #debug --------------------------------------------
    // console.log("\n\nslash-commands.js / handleSlash (): ----------------------");
    // console.log(message.command);
    //----------------------------------------------------

    switch (message.command) {
        /*
            Testing purpose. 
        */
        case '/talk':

            bot.reply(message, 'Sup. Slash commands are now working.');
            console.log('\n-------------------------------------------------------\n');
            console.log(message);
            console.log('\n-------------------------------------------------------\n');
            break;

        /*
            Prints the showdown message block.
        */
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

        /*
            Get all lobbies.
        */
        case '/get-lobby':

            const all_lobbies = await getlobbies();
            if (all_lobbies.length === 0) {
                // There is no lobby
                bot.reply(message, 'There are no available lobbies recorded in database.');
            }
            else {
                // There are some lobbies
                bot.reply(message, `There are currently ${all_lobbies.length} lobbies available...which one do you want to join?`);
                // ...............................
                // todo : 						..
                // start a conversation			..
                // make decisions				..
                // ...............................
            }
            break;

        /*
            makes new lobby.
        */
        case '/make-lobby':
            const newlobby = await createLobby({
                name: message.text,
                // -------- Optional data to init ------------ 
                // maxPlayers : ,
                currentPlayers: 1,
                playerList: [message.user_id],
                // buyin :
                // -------------------------------------------
            });
            bot.reply(message, `New lobby [${newlobby.name}] created! Currently has [${newlobby.currentPlayers}] players...`);
            break;

        /*
            joins a specified lobby by name.
        */
        case '/join-lobby':
            const lobby_name = message.text;
            const user_id = message.user_id;
            const thisLobby = addPlayer(user_id, lobby_name);
            // #debug -------------------------------------
            // console.log(message);
            //---------------------------------------------
            break;

        /*
            Check the detail of one lobby.
                Displays lobby name, [cur # players / max ], player1 player2 player3.
        */
        case '/check-lobby':
            const gotThisLobby = await getOneLobby(message.text);
            if (gotThisLobby) {
                const lobby_name = gotThisLobby.name;
                const cur_p = gotThisLobby.currentPlayers;
                const max_p = gotThisLobby.maxPlayers;
                const players = gotThisLobby.playerList;
                const buyin = gotThisLobby.buyin;
                // #debug --------------------------------
                // console.log(gotThisLobby);
                //----------------------------------------

                var str = `Info for the requested lobby:\n`;
                str = str.concat(lobby_name, ` [`, cur_p, `/`, max_p, `] | Buy-in $`, buyin, ` | `);
                players.forEach((player) => { str = str.concat(`<@${player}>, `) });
                str = str.substr(0, str.length - 2);
                // #debug --------------------------------
                // console.log(str);
                //----------------------------------------
                bot.reply(message, str);
            }
            else {
                // Could not find lobby
                bot.reply(message, `No lobby matches the lobby name you provided.`);
            }
            break;

        /*
            deletes all lobbies.
        */
        case '/clear_lob':
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