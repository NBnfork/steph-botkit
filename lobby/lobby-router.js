/*
	Lobby / Lobby-Router

	Description:
	- This js containts Lobby related DB functions:
		- get all lobbies
		- get lobby by ID
		- get lobby by Name
		- create a lobby
		- delete a lobby

	- "Lobby" model reference:
		- Attributes:
			> name : string | Lobby name
			> maxPlayers : int | Max num of players
			> currentPlayers : int | Current num of players
			> [playerList] : string | An array of player ID
			> buyin : int | $ Buy-in when enter the lobby
			> minBet : int | minimum bet amount = big blind = (Buy-in / 25) 
		- refer to lobby/lobby-model.js

	Exports:
		- getlobbies
		- getOneLobby
		- createLobby
		- updateLobby
		- addPlayer
		- deleteLobby
		- deleteLobbyAll
*/


const lobby = require('./lobby-model');

/*----------------------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] Get All Lobbies
|
|	Description:
|	- Uses Mongoose function <my_model>.find() 
|	- to retrieve all lobbies from database
|
|	 																				*/
const getlobbies = async () => {
	try {
		const lobby_list = await lobby.find({});
		return lobby_list;
	} catch (e) {
		// error statement
		return e;
	}
}
//----------------------------------------------------------------------------------



/*------------------------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] Get One Lobby
|
|	Description:
|	- Uses Mongoose function <my_model>.findByID(id) 
|	- to retrieve a lobby from DB
|
|	 																				*/
const getOneLobby = async (lobby_name) => {
	try {
		const thisLobby = await lobby.findOne({ name: lobby_name });
		return thisLobby;
	} catch (e) {
		return e;
	}
}
//------------------------------------------------------------------------------------



/*------------------------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] Create a Lobby
|
|	Description:
|	- Creates a lobby instance 
|	- and saves to DB
|
|	 																				*/
const createLobby = async (data) => {
	try {
		// ...............................
		// todo : 						..
		// find lobby by name			..
		// if exist						..
		// return a complaint			..
		// ...............................

		// ...........................................
		// todo : 									..
		// check if user is already in a lobby		..
		// if yes									..
		// return a complaint						..	
		// ...........................................

		const newlobby = new lobby(data);		// Constructs a lobby locally with the passed in { data }
		await newlobby.save(); 					// This pushes the locally created lobby up to the DB

		// #debug ----------------------
		// console.log(`\nNew lobby [ ${newlobby.lobbyName} ]  is saved to database, ID = [${newlobby.id}]\n`);
		//------------------------------

		return newlobby;

	} catch (e) {
		//Something bad happened
		console.log(e);
		return e;
	}
}
//----------------------------------------------------------------------------------

/*------------------------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] Edit(Update) a Lobby
|
|	Description:
|	- Uses Mongoose function findOneAndUpdate 
|	- to update the lobby data with the matching lobby name provided
|	- returns the updated lobby model
|
|	 																				*/
const updateLobby = async (lobby) => {
	try {
		const updated_lobby = await lobby.findOneAndUpdate(lobby.name, lobby);
		return updated_lobby;
	} catch (e) {
		console.log(e);
		return e;
	}
}
//----------------------------------------------------------------------------------

/*-----------------------------------------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] Add Player
|
|	Description:
|	- Uses Mongoose function findOneAndUpdate 
|	- to update the lobby data with the matching lobby name provided
|	- returns the updated lobby model
|
|	 																								*/
const addPlayer = async (user_id, lobby_name) => {
	try {
		// get that lobby's data
		const thisLobby = await lobby.findOne({ name: lobby_name });
		if (thisLobby) {
			if (thisLobby.currentPlayers < thisLobby.maxPlayers) {
				// update the lobby data
				thisLobby.playerList.push(user_id);		// add player's slack user_id to the playerList array
				thisLobby.currentPlayers += 1;			// add 1 player count 
				await thisLobby.save();					// saves to DB
			}
			else {
				// lobby is full 
				console.log("\nDebug: lobby/lobby-routers(): Lobby is full, failed to add player.\n");
			}
		}
		else {
			// lobby doesn't exist, no match
			console.log("\nDebug: lobby/lobby-routers(): No lobby name match, cannot Add Player.\n");
		}
		return thisLobby;
	} catch (e) {
		console.log(e);
		return e;
	}
}
//-------------------------------------------------------------------------------------------------------

/*----------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] deleteLobby
|
|	Description:
|	- Uses Mongoose function findByIdAndDelete 
|	- to delete the lobby data with lobby ID provided
|	- returns the deleted lobby model
|
|	 																	*/
const deleteLobby = async (id) => {
	try {
		const lobby = await lobby.findByIdAndDelete(id);
		return lobby;
	} catch (e) {
		// error statements
		console.log(e);
		return e;
	}
}
//----------------------------------------------------------------------

/*----------------------------------------------------------------------
|	[Lobby / Lobby-Router.js] deleteLobbyAll
|
|	Description:
|	- Uses Mongoose function deleteMany
|	- to delete all lobbies in DB
|	- returns an array of deleted lobbies
|
|	 																	*/
const deleteLobbyAll = async () => {
	try {
		const deletedLobbies = await lobby.deleteMany({});
		return deletedLobbies;
	} catch (e) {
		// error statements
		console.log(e);
		return e;
	}
}
//----------------------------------------------------------------------


module.exports = {
	getlobbies,
	getOneLobby,
	createLobby,
	updateLobby,
	addPlayer,
	deleteLobby,
	deleteLobbyAll,
};