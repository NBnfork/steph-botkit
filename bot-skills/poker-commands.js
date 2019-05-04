const message_blocks = require('../message-blocks/poker-messages');
const {
    registerPlayer,
    registerLobby,
    playerJoinLobby,
    lobbyIsFull,
    getLobbyByName,
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
        const user_slack_id = message.user_id;
        const user_slack_name = message.user_name;
        let user = await getPlayer(user_slack_id);

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
        let userIsOnRecord = true;
        if (!userIsOnRecord) {
            /*           Create a user                */
            user = await registerPlayer(user_slack_id, user_slack_name);
            res = await assignChip(user_slack_id, 1000000);
        }
        else {
            let user_set_lobby_name = 'rename this';
            let user_set_buyin = -1;

            /*      Get the lobby name from user       */
            let validName = false;
            while (!validName) {
                convo.ask('What is the name of your lobby? Please enter a lobby name.', function (response, convo) {
                    user_set_lobby_name = response;
                    convo.next();
                });
                // ...............................
                // todo : 						..
                // find lobby by name			..
                // if exist						..
                //      explain to user         ..
                // else                         ..
                //      set validName to true   ..
                // ...............................   
            }

            /*      Get the lobby buy-in from user      */
            let validBuyin = false;
            while (!validBuyin) {
                // ...............................
                // todo : 						..
                // give user a drop down menu   ..
                // to choose buy-in             ..
                // if player has enough in bank ..
                //              and buy-in > 0	..
                validBuyin = true;
                // else                         ..
                //      explain to user         ..
                // ...............................                  
            }
            user_set_buyin = 50000;

            const created_lobby = await registerLobby(user_set_lobby_name, user_set_buyin);

            const updated_lobby = await PlayerJoinLobby(user.slack_id, created_lobby.name);

            if (updated_lobby) {
                console.log(`Debug: Created lobby successfully and added user to lobby successfully:\nLobby Name = ` + updated_lobby.name + ` & User Name = ` + user.name` \n`);
            } else {
                console.log(`Debug: poker-command.js : seems like there was problem creating and joining lobby.\n`);
            }
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
                            const str = '<@' + message.user + '> has joined a game lobby.';
                            convo.say(str);
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
            console.log('\n\n-------------------[message]\n', message);
            // ########################################
        });
    });
}

// module.exports = {
//     joinPoker
// }
