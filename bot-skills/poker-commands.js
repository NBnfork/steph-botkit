const message_blocks = require('../message-blocks/poker-messages');
const {
    registerPlayer,
    registerLobby,
    playerJoinLobby,
    lobbyIsFull,
    getLobby,
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

const createNewUser = async (convo, user, user_data) => {
    /*           Create a user                */
    let res = {};
    const new_player_chips = 1000000;
    convo.say(`I have created a new account for you, <@${user_data.slack_id}>. You now have \$${new_player_chips}.`);

    user = await registerPlayer(user_data);
    user = await assignChip(user_data, new_player_chips);
    if (!user) {
        console.log(`\n----------------------\nERROR! poker-commands.js failed to create user / assign chip.\n----------------------\n`)
        convo.say('Oops! poker-commands.js failed to create a user. Ask for help.');
    }
    return user;
}

/*------------------------------------------------------------------------------------
|   Setup Lobby
|
|   Description:
|   This is a callback function.
|   Assumes the necessary inputs have been recieved in convo.vars
|                                                                                   */
const setupLobby = async (convo, user_data, user) => {

    let text = 'Lobby name is \"' + convo.vars.lobby_name + '\", and buy-in is $[' + convo.vars.lobby_buyin + '].\nJust a moment <@' + user.slack_id + '>, let me try to set things up for you...';
    convo.say(text);

    /*      Only execute the the default values are properly overwritten        */
    if (convo.vars.lobby_name && convo.vars.lobby_buyin) {
        //convo.say('testing2');
        /*      Create Lobby with the given info        */
        const created_lobby = await registerLobby({ name: convo.vars.lobby_name, buyin: convo.vars.lobby_buyin });
        convo.say('Created lobby \"' + created_lobby.name + '\".');

        /*      Add this player to the new lobby        */
        const updated_lobby = await playerJoinLobby(user_data, created_lobby._id);
        convo.say('<@' + user.slack_id + '> is waiting in the lobby.');

        /*      Check if the last procedure was successful      */
        if (updated_lobby) {

            convo.say('Game starts as soon as another player joins.');
            convo.say('Ping me if anyone would like to join the game.')
            convo.next();
            return updated_lobby;
        } else {
            console.log(`Debug: poker-commands.js : seems like there was problem creating and joining lobby.\n`);
            convo.say(`Oops! poker-copmmands.js has an error. :O`);

        }
    }
    else {
        convo.say(`Oops! poker-copmmands.js has an error. :O`);

    }
}

const getLobbyBuyinFromUser = (convo, user_data, user) => {
    /*      Get the lobby buy-in from user      */
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
    convo.ask('What is the buyin for this lobby? Please enter a value. (Recommend $50000)', [
        {
            default: true,
            callback: function (reply, convo) {

                convo.setVar('lobby_buyin', reply.text);
                // #debug--------------------
                // console.log('\n--- vars.lobby_name (2) ---\n');
                // console.log(convo.vars.lobby_name);
                // console.log('\n--- user ---\n');
                // console.log(user);
                //----------------------------

                if (user.bank < convo.vars.lobby_buyin) {
                    console.log("\npoker-commands.js->getLobbyBuyinFromUser(): Player overdraft.\n");
                    convo.say('It appears that your bank account do not have enough chips. You have $' + user.bank + ' but this lobby has a $' + convo.vars.lobby_buyin + '.');

                    return false;
                }
                convo.next();
                setupLobby(convo, user_data, user);

            }
        }
    ]);
}

/*------------------------------------------------------------------------------------
|   Get Lobby Name from User
|
|   Description:
|   This is a callback function.
|   Gets a lobby name from user
|                                                                                   */
const getLobbyNameFromUser = (convo, user_data, user) => {
    convo.ask('What is the name of your lobby? Please enter a lobby name.', [
        {
            default: true,
            callback: function (reply, convo) {
                convo.setVar('lobby_name', reply.text);
                convo.next();

                /*      Get the lobby buy-in from user      */
                getLobbyBuyinFromUser(convo, user_data, user);
            }
        }
    ]
    );

}

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
        /*      Load user data from DB by slack user ID         */
        let user_data = {};
        user_data.slack_id = message.user.id;
        user_data.name = message.user.name;
        user_data.team_id = message.team.id;
        user_data.team_name = message.team.domain;
        let NEW_PLAYER = true;

        let user = await getPlayerByID(user_data);

        if (user) {
            NEW_PLAYER = false;
            convo.say(`Welcome back, <@${user.slack_id}>`);
            if (user.isInLobby) {
                convo.say('It appears that you are already in a game. You cannot create new lobby until you quit the current game. Please try again later.');
                convo.next();
                return null;
            }
            convo.next();
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
            user = await createNewUser(convo, user, user_data);
        }

        /*      Get the lobby name from user       */
        return await getLobbyNameFromUser(convo, user_data, user);

    } catch (e) {
        // Error statments
        console.log(e);
        return e;
    }
}


// ------- Assign selected message blocks to local const ----------- //
const showdown = message_blocks.showdown_mockup;
//-------------------------------------------------------------------//
const testShowCards = (message, bot) => {
    bot.sendWebhook({
        blocks: showdown,
        channel: message.channel_id,
    }, function (err, res) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = async (controller) => {
    controller.hears(['poker'], 'direct_message,direct_mention', function (bot, message) {
        bot.startConversation(message, function (err, convo) {
            convo.say('Shall we start a game?');
            convo.ask(
                { attachments: create_or_join },                    // buttons available
                [
                    {
                        pattern: "yes",                                 // if response is yes
                        callback: async (reply, convo) => {             // do this procedure as callback
                            let res = await create_lobby_callback(convo, reply.raw_message);        // the actual callback function
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
        });
    });
    controller.hears(['test cards'], 'direct_message,direct_mention', function (bot, message) {

        bot.reply(message, 'Here are the cards.');
        /*      Send card message block    */
        testShowCards(message, bot);

    });


}
