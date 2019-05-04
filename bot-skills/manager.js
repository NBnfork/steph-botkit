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

const getLobbyByID = async (lobby_id) => {
    const thisLobby = await getOneLobby(lobby_id);
    if (thisLobby) {
        return thisLobby;
    }
    else {
        return null;
    }

}

const getPlayerByID = async (player_data) => {
    const thisPlayer = await getOnePlayer(player_data);
    if (thisPlayer) {
        return thisPlayer;
    }
    else {
        return null;
    }

}

/*----------------------------------------------------------------------
|	[Manager.js] Remove Player from Lobby
|
|	Description:
|   - Handles player leaving a lobby
|	- Calls player.checkOut procedure
|	- Validations for these actions
|	 																	*/
const lobbyRemovePlayer = async (player_data) => {
    /*      Get player      */
    const thisPlayer = await getPlayerByID(player_data);
    /*      Check-out Player    */
    if (thisPlayer) {
        thisPlayer = await checkOut(thisPlayer);
    }
    else {
        // #debug ------------------------------------
        console.log(`\nmanager.js -> lobbyRemovePlayer() : getOnePlayer did not find user\n` + player_data.slack_id);
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
const getPlayerBank = async (player_data) => {
    const thisPlayer = await getPlayerByID(player_data);
    const chips = thisPlayer.bank;
    return chips;
}

const registerPlayer = async (player_data) => {
    await createPlayer(player_data);
    const newPlayer = await getPlayerByID(player_data);
    return newPlayer;
}

const registerLobby = async (lobby_data) => {
    await createLobby(lobby_data);
    const newLobby = await getLobbyByName(name);
    return newLobby;
}

const getLobbyPlayers = async (lobby_id) => {
    const playerList = await getAllPlayerInLobby(lobby_id);
    const num_players = playerList.length();
    return { num_players, player_list };
}

const playerJoinLobby = async (user_data, lobby_id) => {
    const thisPlayer = await getPlayerByID(user_data);
    const thisLobby = await getLobbyByID(lobby_id);
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
    let currPlayers = await getLobbyPlayers();
    if (currPlayers.num_players >= thisLobby.maxPlayers) {
        valid = false;
    }

    // check-in player to lobby
    const updatedPlayer = await checkIn(thisPlayer);
    if (updatedPlayer) {
        // #debug -----------------------------
        currPlayers = await getLobbyPlayers();
        console.log(`\n------------------\nCheck: ` + updatedPlayer.user_name + ` is in [\n` + currPlayers.player_list + `]-------------\n`)
        //-------------------------------------
        const updated_lobby = await getLobbyByID(lobby_id);
        if (updated_lobby) {
            return updated_lobby;
        }

    } else {
        // #debug -----------------------------
        currPlayers = await getLobbyPlayers();
        console.log(`\n------------------\nFailed to add ` + updatedPlayer.user_name + `. This is the lobby: [\n` + thisLobby + `]-------------\n`)
        //-------------------------------------      
        return null;
    }

}


const getAllLobby = async () => {
    // append all players to each lobby
    // returns all lobby objects

}

const assignChip = async (player_data, amount) => {
    /*      Adds chips to user's bank (DB) by Slack user ID     */
    if (amount < 0) {
        console.log(`\nmanager.js->assignChip: attempted to deposit $` + amount`\n`);
        return null;
    }
    const updatedPlayer = await deposit(player_data, amount);
    return updatedPlayer;
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
    getLobbyByID,
    getLobbyPlayers,
    getAllLobby,
    lobbyRemovePlayer,
    getPlayerByID,
    getPlayerBank,
    assignChip,
    withdrawChip
};