const lobby = require('./lobby-model');
const express = require('express'); //using get/post here..
const router = new express.Router();

//Gets all lobby
const getlobbies = async () =>{  
	try {
        const alllobbys = await lobby.find({});
		return alllobbys;
	} catch(e) {
		// statements
		return e;
	}	
}

//Gets a lobby
const getOnelobby = async (id) =>{
    try {
        const lobby = await lobby.findById(req.params.uID);
        return lobby;
	} catch(e) {
		return e;
	}	
}

// //Makes a new lobby
// router.post('/', async (req, res)=>{

// 	console.log("lobby router: POST request - \n", req.body);
const createLobby = async ( data )=>{
	try {
		const newlobby = new lobby(data);
		await newlobby.save(); //Don't save till the lobby is created
		
		console.log(`New lobby [ ${newlobby.lobbyName} ]  is saved to database`);
		return newlobby;
	} catch(e) {	//Something bad happened.
		return e;
	}
}


// TO-DO : we probably need these functions eventually?
// For now I blocked them out because they're routers from the old files and are not ready for immediate use.

// //Edit a lobby
// router.patch('/:uID', async(req, res)=>{
// 	const lobby = await lobby.findById(req.params.uID);
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

// router.delete('/:uID', async (req, res)=>{
// 	try {
// 		const lobby = await lobby.findByIdAndDelete(req.params.uID);
// 		res.send(lobby);
// 	} catch(e) {
// 		// statements
// 		console.log(e);
// 		res.status(500).send();
// 	}
// });

module.exports = {
    getlobbies,
	getOnelobby,
	createLobby
};