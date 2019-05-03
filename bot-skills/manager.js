const {
    getlobbies,
    getOneLobby,
    createLobby,
    addPlayer,
    deleteLobbyAll
} = require('../lobby/lobby-router');

const {
    checkIn,
    checkOut,
    createPlayer,
    withdraw,
    deposit,
    getPlayer,
} = require('../player/player-router');

const registerPlayer = async (user_id, user_name) => {

}

const registerLobby = async (lobby_name, buyin) => {

    // return lobby
}

const playerJoinLobby = async () => {

}

const checkLobbyFull = async () => {

}

const checkLobby = async (name) => {
    // returns one lobby by name
}

const getAllLobby = async () => {
    // returns all lobby objects
}

const lobbyRemovePlayer = async (user_id) => {
    // remove a user from current lobby, by Slack user ID
}

const getPlayerByID = async (user_id) => {
    // get a user from DB by Slack user ID
}

const getPlayerBank = async (user_id) => {
    // read the chip amount from user's bank (DB) by Slack user ID
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
    checkLobbyFull,
    checkLobby,
    getAllLobby,
    lobbyRemovePlayer,
    getPlayerByID,
    getPlayerBank,
    assignChip,
    withdrawChip
};