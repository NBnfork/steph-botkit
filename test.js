/*************************************************************************
 * This is the unit test suite for the Imai: texas hold'em slackbot.
*************************************************************************/
var expect = require('chai').expect;

//for use of random-js
const { Random } = require("random-js");
const r = new Random(); // uses the nativeMath engine

/**********************************
 * File: player-router.js
 * Functions:
 *  createPlayer()
 *  checkIn()
 *  checkOut()
 *  withdraw()
 *  deposit()
 *  getOnePlayer()
 *  getAllPlayerInLobby()
 *
 *******************************/
const ply = require ('./player/player-router');
const player = require('./player/player-model');
describe('createPlayer()', function(){
    it('Should create a new player and save it to the db', async function(){
        //make random player
        var rPlayer = {
            slack_id: r.string(8),
            name: r.string(8),
            team_id: r.string(6),
            team_domain: r.string(6),
            bank: r.integer(2500, 250000),
            lastLobby: r.string(8),
            wallet: r.integer(2500, 10000),
            isInLobby: r.bool()
        };
        console.log(rPlayer);
        //call
        await ply.createPlayer(rPlayer);
        //get player
        let newPlayer = await player.findOne({slack_id: rPlayer.slack_id, team_id: rPlayer.team_id });
        console.log(newPlayer);
        //compare contents
        for(var i in newPlayer){
            expect(newPlayer.i).to.equal(rPlayer.i);
        }
    });
});



