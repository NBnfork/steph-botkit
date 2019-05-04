/*
	Player / Player-Router

	Description:
	- This is a collection of lower level player-DB communication

	- "Player" model reference:
        - Attributes:
            > slack_id: string | Player's slack ID
            > name : string | Player name
            > bank : int | Amount of Chips in bank
            > lastLobby : string | Last Played Lobby
            > wallet : int | Amount of Chips in wallet (withdrawn)
            > isInLobby : Boolean | Whether player is current in a lobby ( on record )
		- refer to player/player-model.js

    Exports:
        - createPlayer
		- checkIn
		- checkOut
		- withdraw
        - deposit
        - getPlayer
*/

const player = require('./player-model');


/*----------------------------------------------------------------------------------
|	[Player / Player-Router.js] Create Player
|
|	Description:
|	- Creates a player instance 
|	- and saves to DB
|
|	 																				*/
const createPlayer = async (data) => {
    try {
        // #debug ------------------------
        // let data = {
        //     slack_id: user_id,
        //     name: user_name
        // };
        // -------------------------------
        const newPlayer = new player(data);		    // Constructs a player locally with the passed in data {user_id and user_name}
        await newPlayer.save(); 					// This pushes the locally created player up to the DB

    } catch (e) {
        // error statement
        console.log(e);
        return e;
    }
}
//----------------------------------------------------------------------------------


/*----------------------------------------------------------------------------------
|	[Player / Player-Router.js] Check-in Player
|
|	Description:
|	- Player has joined a lobby 
|	- Arguments: {user_id, lobby_name, buyin}
|   - Update: bank, wallet, lastLobby, isInLobby
|   - Does not check if lobby exist
| 
|	 																				*/
const checkIn = async (user_id, lobby_name, buyin) => {
    try {
        let thisPlayer = await player.findOne({ slack_id: user_id });
        /*      Catch No User error             */
        if (!thisPlayer) {
            console.log('\nError at player/player-router.js -> checkIn()! Should not reach here, manager did not check if player exist in dB.\n');
            return null;
        }

        /*      Player can join the lobby       */
        if (thisPlayer.bank >= buyin && !thisPlayer.isInLobby) {

            /*       Update Player data         */
            thisPlayer.bank -= buyin;
            thisPlayer.wallet = buyin;
            thisPlayer.lastLobby = lobby_name;
            thisPlayer.isInLobby = true;
            //------------------------------------

            /*        Push Player updates        */
            const updatedPlayer = await player.findOneAndUpdate(thisPlayer.slack_id, thisPlayer);
            return updatedPlayer;
        }
        else {      /*      Player cannot join the lobby        */
            console.log('\nError at player/player-router.js -> checkIn()! Should not reach here, manager did not check for bank balance, player overdraft, or Player already in lobby, double-joined.\n');
            return thisPlayer;
        }
    } catch (e) {
        // error statement
        console.log(e);
        return e;
    }
}
//----------------------------------------------------------------------------------

/*----------------------------------------------------------------------------------
|	[Player / Player-Router.js] Check-out Player
|
|	Description:
|	- Player has joined a lobby 
|	- Arguments: {user_id, lobby_name, buyin}
|   - Update: bank, wallet, lastLobby, isInLobby
|   - Does not check if lobby exist (no error, but may oversee bugs)
|	 																				*/
const checkOut = async (thisPlayer) => {
    try {

        /*      Catch No User error             */
        if (!thisPlayer) {
            console.log('\nError at player/player-router.js -> checkOut()! Should not reach here, manager did not check if player exist in dB.\n');
            return null;
        }

        /*      Player can leave lobby         */
        if (thisPlayer.isInLobby) {

            /*       Update Player data         */
            thisPlayer.bank += thisPlayer.wallet;
            thisPlayer.wallet = 0;
            thisPlayer.isInLobby = false;
            //------------------------------------

            /*        Push Player updates        */
            const updatedPlayer = await player.findOneAndUpdate(thisPlayer.slack_id, thisPlayer);
            return updatedPlayer;
        }
        else {      /*      Player cannot join the lobby        */
            console.log('\nError at player/player-router.js -> checkOut()! Should not reach here, manager did not check if player exist\n');
            return null;
        }
    } catch (e) {
        // error statement
        console.log(e);
        return e;
    }
}
//----------------------------------------------------------------------------------

/*--------------------------------------------------------------------
|	[Player / Player-Router.js] Withdraw
|
|	Description:
|	- Special usage, withdraw chips directly
|																	*/
const withdraw = async (user_id, chips) => {

}
//--------------------------------------------------------------------

/*--------------------------------------------------------------------
|	[Player / Player-Router.js] Deposit
|
|	Description:
|	- Special usage, deposit chips directly
|																	*/
const deposit = async (user_id, chips) => {

}
//--------------------------------------------------------------------

/*--------------------------------------------------------------------
|	[Player / Player-Router.js] Get Player
|
|	Description:
|	- Returns one player if exist
|																	*/
const getOnePlayer = async (user_id) => {
    try {
        const thisPlayer = await player.findOne({ slack_id: user_id });
        return thisPlayer;
    } catch (e) {
        console.log(e);
        return null;
    }
}
//--------------------------------------------------------------------

/*--------------------------------------------------------------------
|	[Player / Player-Router.js] Get Player
|
|	Description:
|	- Returns one player if exist
|																	*/
const getAllPlayerInLobby = async (lobby_name) => {

}
//--------------------------------------------------------------------

module.exports = {
    createPlayer,
    checkIn,
    checkOut,
    withdraw,
    deposit,
    getOnePlayer,
    getAllPlayerInLobby

};