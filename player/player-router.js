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
        const lobby_list = await lobby.find({});
        return lobby_list;
    } catch (e) {
        // error statement
        return e;
    }
}
//----------------------------------------------------------------------------------
