const {
    getlobbies,
    getOneLobby,
    createLobby,
    deleteLobbyAll
} = require('../lobby/lobby-router');

const {
    checkIn,
    checkOut,
    createPlayer,
    withdraw,
    deposit,
    getOnePlayer,
    getAllPlayerInLobby
} = require('../player/player-router');

const getLobbyByName = async (name) => {
    const thisLobby = await getOneLobby(name);
    return thisLobby;
}

const getPlayerByID = async (slack_id) => {
    const thisPlayer = await getOnePlayer(slack_id);
    return thisPlayer;
}

/*----------------------------------------------------------------------
|	[Manager.js] Remove Player from Lobby
|
|	Description:
|   - Handles player leaving a lobby
|	- Calls player.checkOut procedure
|	- Validations for these actions
|	 																	*/
const lobbyRemovePlayer = async (slack_id) => {
    /*      Get player      */
    const thisPlayer = await getPlayerByID(slack_id);
    /*      Check-out Player    */
    if (thisPlayer) {
        thisPlayer = await checkOut(thisPlayer);
    }
    else {
        // #debug ------------------------------------
        console.log(`\nmanager.js -> lobbyRemovePlayer() : getOnePlayer did not find user\n` + user_id);
    }

    return thisPlayer;                 // Returns updated player object OR null

}

const lobbyIsFull = async (lobby_name) => {
    /*      Get lobby           */
    const thisLobby = await getLobbyByName(lobby_name);

    /*      Return if not found     */
    if (!thisLobby) {
        // #debug --------------------------------------
        console.log(`\nWarning! manager.js -> lobbyIsFull(): queried a lobby that does not exist, returning false\n`);
        // ---------------------------------------------
        return true;
    }

    /*      Count players       */
    const playerList = await getAllPlayerInLobby(lobby_name);

    /*      Check Occupance     */
    if (playerList.length() < thisLobby.maxPlayers) {
        return false;
    }
    return true;
}

/*      Read the chip amount from user's bank (DB) by Slack user ID     */
const getPlayerBank = async (slack_id) => {
    const thisPlayer = await getPlayerByID(slack_id);
    const chips = thisPlayer.bank;
    return chips;
}

const registerPlayer = async (slack_id, name) => {
    await createPlayer({ slack_id, name });
    const newPlayer = await getPlayerByID(slack_id);
    return newPlayer;
}

const registerLobby = async (name, buyin) => {
    await createLobby({ name, buyin });
    const newLobby = await getLobbyByName(name);
    return newLobby;
}

const getLobbyPlayers = async (lobby_name) => {
    const playerList = await getAllPlayerInLobby(lobby_name);
    const num_players = playerList.length();
    return { num_players, player_list };
}

const playerJoinLobby = async (slack_id, lobby_name) => {
    const thisPlayer = await getPlayerByID(slack_id);
    const thisLobby = await getLobbyByName(lobby_name);
    // check if player exist
    if (!thisPlayer) {
        return {
            success: false,
            player: undefined,
            lobby: undefined,
            text: `Could not fint this user [` + slack_id + `] in record.`
        };
    }
    // check if player is already in lobby
    if (thisPlayer.isInLobby) {
        return {
            success: false,
            player: thisPlayer,
            lobby: undefined,
            text: `<@${thisPlayer.slack_id}> is already in lobby.`
        };
    }
    // check if lobby exist    
    if (!thisLobby) {
        valid = false;
    }
    // check if player bank >= buyin
    if (thisPlayer.bank < thisLobby.buyin) {
        valid = false;
    }


    // check if lobby curr player < max players

    // check-in player to lobby
}


const getAllLobby = async () => {
    // append all players to each lobby
    // returns all lobby objects

}



const assignChip = async (user_id, amount) => {
    // adds chips to user's bank (DB) by Slack user ID
    // cannot be negative
    // return {assignChip : `success`}

}

const withdrawChip = async (user_id, amount) => {
    // removes chips from user's bank (DB) by Slack user ID
    // cannot be negative
    // cannot be more than bank's ammount
}


module.exports = {
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
};