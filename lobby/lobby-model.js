const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true
	 },
	maxPlayers: {
		type: Number,
		default: 6  //Means that we don't have to input in the request.
	},
	currentPlayers: {
		type: Number,
		default: 0  //Means that we don't have to input in the request.
	}
});


const lobby = mongoose.model('lobby', lobbySchema);
module.exports = lobby;