/*----------------------------------------------------------------------------------
	Lobby / Lobby-Router

	Description:
	- Lobby related DB functions:
		- get all lobbies
		- get lobby by ID
		- get lobby by Name
		- create a lobby
		- delete a lobby

	- "Lobby" model:
		- Attributes:
			> name : string | Lobby name
			> maxPlayers : int | Max num of players
			> currentPlayers : int | Current num of players
			> [playerList] : string | An array of player ID
			> buy-in : int | $ Buy-in when enter the lobby
			> minBet : int | minimum bet amount = big blind = (Buy-in / 25) 
		- refer to lobby/lobby-model.js

----------------------------------------------------------------------------------*/


const lobby = require('./lobby-model');

/*----------------------------------------------------------------------------------
	Lobby / Get All Lobbies

	Description:
	- Uses Mongoose function <my_model>.find() to retrieve all lobbies from database

*/
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



/*----------------------------------------------------------------------------------
	Lobby / Get One Lobby

	Description:
	- Uses Mongoose function <my_model>.findByID(id) to retrieve a lobby from DB

*/
const getOneLobby = async (lobby_name) => {
	try {
		const thisLobby = await lobby.findOne({ name: lobby_name });
		return thisLobby;
	} catch (e) {
		return e;
	}
}
//----------------------------------------------------------------------------------



/*----------------------------------------------------------------------------------
	Lobby / Create a Lobby

	Description:
	- Uses Mongoose function <my_model>.findByID(id) to retrieve a lobby from DB

*/
const createLobby = async (data) => {
	try {
		// todo : ---------------------
		// find lobby by name..
		// if exist
		// return a complaint
		// ---------------------------

		// todo : ---------------------
		// check if user is already in a lobby
		// if yes
		// return a complaint
		// ---------------------------

		const newlobby = new lobby(data);		// Constructs a lobby locally with the passed in { data }
		await newlobby.save(); 					// This pushes the locally created lobby up to the DB

		// #Debug ----------------------
		console.log(`\nNew lobby [ ${newlobby.lobbyName} ]  is saved to database, ID = [${newlobby.id}]\n`);
		//------------------------------

		return newlobby;

	} catch (e) {	//Something bad happened.
		console.log(e);
		return e;
	}
}


// TO-DO : we probably need these functions eventually?
// For now I blocked them out because they're routers from the old files and are not ready for immediate use.

//Edit a lobby
// router.patch('/:uID', async(req, res)=>{
const updateLobby = async (lobby) => {
	try {
		const updated_lobby = await lobby.findOneAndUpdate(lobby.name, lobby);
		return updated_lobby;
	} catch (e) {
		console.log(e);
		return e;
	}
}

const addPlayer = async (user_id, lobby_name) => {
	// push it back up
	try {
		// get that lobby's data and modify
		const thisLobby = await lobby.findOne({ name: lobby_name });
		if (thisLobby.currentPlayers < thisLobby.maxPlayers) {
			thisLobby.playerList.push(user_id);
			thisLobby.currentPlayers += 1;
			await thisLobby.save();
		}
		else {
			console.log("\nDebug: lobby/lobby-routers(): Lobby is full, failed to add player.\n");
		}

		return thisLobby;
	} catch (e) {
		console.log(e);
		return e;
	}
}

// 	const fieldsToEdit = Object.keys(req.body);
// 	try {

// 		//For each field that was requested to be edit, change it.
// 		//Only changes the field that was requested to be changed.
// 		fieldsToEdit.forEach(field => {
// 			lobby[field] = req.body[field];
// 		});

// 		await lobby.save();

// 		res.send(lobby);
// 	} catch(e) {
// 		res.status(404).send({error: "Cannot send that lobby."});
// 	}	

// });


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

module.exports = {
	getlobbies,
	getOneLobby,
	createLobby,
	updateLobby,
	addPlayer,
	deleteLobby,
	deleteLobbyAll,
};