const message_blocks = require('../message-blocks/poker-messages');
const {
    registerPlayer,
    registerLobby,
    playerJoinLobby,
    lobbyIsFull,
    getLobbyByID,
    getLobbyPlayers,
    getAllLobby,
    lobbyRemovePlayer,
    getPlayerByID,
    getPlayerBank,
    assignChip,
    withdrawChip
} = require('./manager.js');


//const Botkit = require('botkit');

/*------------------------------------------------------------------------------------
|   Create Of Join? 
|       Attachment in array format.
|
|                                                                                   */
const create_or_join = [
    {
        title: 'Do you want to proceed?',
        callback_id: '123',
        attachment_type: 'default',
        actions: [
            {
                "name": "yes",
                "text": "Yes",
                "value": "yes",
                "type": "button",
            },
            {
                "name": "no",
                "text": "No",
                "value": "no",
                "type": "button",
            }
        ]
    }
]

/*------------------------------------------------------------------------------------
|   User to create Lobby callback function
|
|   Description:
|   This is a protocol for handling  lobby creation initiated by user.
|   Do not directly use functions from lobby-router (do not directly contact DB).
|   All handler functions should be handled by manager.js
|
|                                                                                   */
const create_lobby_callback = async (convo, message) => {
    try {
        let res = {};

        /*      Load user data from DB by slack user ID         */
        const user_data = {};
        user_data.slack_id = message.user_id;
        user_data.name = message.user_name;
        user_data.team_id = message.team_id;
        user_data.team_name = message.team_id;

        let NEW_PLAYER = true;
        let user = await getPlayerByID(user_data);
        if (user) {
            NEW_PLAYER = false;
        }

        // .......................................................
        // todo : 						                        ..
        // Handle exceptions, low priority                      ..
        // IF user doesn't exist on record                      ..
        //  // Create user if not found on record               ..
        //  //                                                  ..
        //  // if user is already in a lobby                    ..
        //      // say which room he is in, print lobby info    ..
        //      // ask : leave and make a new one? or stay?     ..
        //      // get reply                                    ..
        //      //                                              ..
        //      // if stay                                      ..
        //          // end convo, do nothing                    ..
        //      //                                              ..        
        //      // if leave                                     ..
        //          // lobbyRemoveUser()                        ..
        // .......................................................    

        // ELSE The user is now on record AND not in any Lobby ---
        /* ------------------------------------------------------------------------------------------------------------------
            
            This is the case which player is creating a new lobby to join (rather than joining a created lobby)

        ---------------------------------------------------------------------------------------------------------------------*/

        if (NEW_PLAYER) {
            /*           Create a user                */
            user = await registerPlayer(user_data);
            res = await assignChip(user_data, 1000000);
            if (!user || !res) {
                console.log(`\n----------------------\nERROR! poker-commands.js failed to create user / assign chip.\n----------------------\n`)
                convo.say('Oops! poker-commands.js failed to create a user. Ask for help.');
            }
            convo.next();
        }

        let user_set_lobby_name = 'no_name';
        let user_set_buyin = -1;

        /*      Get the lobby name from user       */
        convo.ask('What is the name of your lobby? Please enter a lobby name.', function (response, convo) {
            user_set_lobby_name = response;
            convo.next();



        });


        /*      Get the lobby buy-in from user      */
        convo.ask('What is the buyin for this lobby? Please enter a value. (Recommend $50000)', function (response, convo) {
            user_set_buyin = response;
            convo.next();
            if (user.bank < user_set_buyin) {
                console.log("\npoker-commands.js->create_lobby_callback(): Player overdraft.\n");
                convo.say('It appears that your bank account do not have enough chips. You have $' + user.bank + ' but this lobby has a $' + user_set_buyin + '.');
                convo.next();
                return false;
            }

        });
        // ...............................
        // todo : 						..
        // give user a drop down menu   ..
        // to choose buy-in             ..
        // if player has enough in bank ..
        //              and buy-in > 0	..
        //      validBuyin = true;      ..
        // else                         ..
        //      explain to user         ..
        // ...............................                  

        convo.say('Lobby name is \"' + user_set_lobby_name + '\", and buy-in is $[' + user_set_buyin + `].\nJust a moment <@${message.user_id}>, let me try to set things up for you...`);
        convo.next();
        /*      Only execute the the default values are properly overwritten        */
        if (user_set_buyin !== -1 && user_set_lobby_name !== 'no_name') {

            /*      Create Lobby with the given info        */
            const created_lobby = await registerLobby({ name: user_set_lobby_name, buyin: user_set_buyin });

            /*      Add this player to the new lobby        */
            const updated_lobby = await playerJoinLobby(user_data, created_lobby._id);

            /*      Check if the last procedure was successful      */
            if (updated_lobby) {
                console.log(`Debug: Created lobby successfully and added user to lobby successfully:\nLobby Name = ` + updated_lobby.name + ` & User Name = ` + user.name` \n`);
                convo.say(`<@${user.user_id}> has created and joined the lobby [` + updated_lobby.name + `].\nWaiting another player to join to start the game.\nPing me if anyone would like to join.`);
                convo.next();
                return true;
            } else {
                console.log(`Debug: poker-commands.js : seems like there was problem creating and joining lobby.\n`);
                convo.say(`Oops! poker-copmmands.js has an error. :O`);
                convo.next();
            }
        }
        else {
            convo.say(`Oops! poker-copmmands.js has an error. :O`);
            return false;
        }
    } catch (e) {
        // Error statments
        console.log(e);
        return e;
    }
}


module.exports = async (controller) => {
    controller.hears(['poker'], 'direct_message,direct_mention', function (bot, message) {
        bot.startConversation(message, function (err, convo) {
            convo.say('Shall we start a game?');
            convo.ask(
                { attachments: create_or_join },
                [
                    {
                        pattern: "yes",
                        callback: function (reply, convo) {
                            //const str = '<@' + message.user + '> has joined a game lobby.';
                            //convo.say(str);
                            // #debug --------------------------------
                            console.log('\n------------------------\n' + reply + '\n');
                            //----------------------------------------
                            create_lobby_callback(convo, message);
                            convo.next();
                        }
                    },
                    {
                        pattern: "no",
                        callback: function (reply, convo) {
                            convo.say('Maybe next time.');
                            convo.next();
                        }
                    },
                    {
                        default: true,
                        callback: function (reply, convo) {
                            convo.say('\(... did not get a response...\)');
                        }
                    }
                ]);

            // #debug #################################
            // console.log('\n\n-------------------[message]\n', message);
            // ########################################
        });
    });
}

// module.exports = {
//     joinPoker
// }
