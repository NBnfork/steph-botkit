/*
	Player / Player-Router

	Description:
	- This js containts Lobby related DB functions:
		-

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
const createPlayer = async (user_id, user_name) => {
    try {
        let data = {
            slack_id = user_id,
            name = user_name
        };
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
|   - Does not check if lobby exist
|	
|	 																				*/
const checkOut = async (user_id, chips) => {
    try {
        let thisPlayer = await player.findOne({ slack_id: user_id });
        /*      Catch No User error             */
        if (!thisPlayer) {
            console.log('\nError at player/player-router.js -> checkOut()! Should not reach here, manager did not check if player exist in dB.\n');
            return null;
        }

        /*      Player can leave lobby         */
        if (thisPlayer.isInLobby) {

            /*       Update Player data         */
            thisPlayer.bank += chips;
            thisPlayer.wallet = 0;
            thisPlayer.isInLobby = false;
            //------------------------------------

            /*        Push Player updates        */
            const updatedPlayer = await player.findOneAndUpdate(thisPlayer.slack_id, thisPlayer);
            return updatedPlayer;
        }
        else {      /*      Player cannot join the lobby        */
            console.log('\nError at player/player-router.js -> checkOut()! Should not reach here, manager did not check for bank balance, player overdraft, or Player already in lobby, double-joined.\n');
            return thisPlayer;
        }
    } catch (e) {
        // error statement
        console.log(e);
        return e;
    }
}
//----------------------------------------------------------------------------------



module.exports = {
    createPlayer,
    checkIn,
    checkOut,
    withdraw,
    deposit,
    getPlayer,

};