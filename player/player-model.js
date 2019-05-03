/*
	Player / Player-Model
	
	Description:
	- Defines a "player" schema
	- returns the player
    - Attributes:
        > slack_id: string | Player's slack ID
		> name : string | Player slack name
		> bank : int | Amount of Chips in bank
        > lastLobby : string | Last Played Lobby
        > wallet : int | Amount of Chips in wallet (withdrawn)
        > isInLobby : Boolean | Whether player is current in a lobby ( on record )

*/

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    slack_id: {
        type: String
    },
    name: {
        type: String
    },
    bank: {
        type: Number,
        default: 0
    },
    lastLobby: {
        type: String 		// Last played lobby's ID
    },
    wallet: {
        type: Number,
        default: 0
    },
    isInLobby: {
        type: Boolean,
        default: false
    }
});


const player = mongoose.model('player', playerSchema);
module.exports = player;