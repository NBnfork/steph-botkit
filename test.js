/*************************************************************************
 * This is the unit test suite for the Imai: texas hold'em slackbot.
*************************************************************************/
var expect = require('chai').expect;
const Botkit = require('botkit');
//----------------------------------------
/*          MongoDB storage             */
const mongodbStorage = require('./phe-storage-mongoose/index.js')({
    mongoUri: process.env.MONGODB,
});
//----------------------------------------
/*      Controller, the Slackbot        */
const controller = Botkit.slackbot({
    storage: mongodbStorage,
    debug: false,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
});
//----------------------------------------
/*        Configure Controller          */
controller.configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    scopes: ['commands', 'bot', 'incoming-webhook'],
});
//----------------------------------------
/*      Spawns "bot" from Controller    */
const bot = controller.spawn({
    token: process.env.BOT_TOKEN,
    incoming_webhook: {
        url: process.env.SLACK_WEBHOOK
    }
}).start
holdForStartUp();
//----------------------------------------
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
//make random player
function makeRandPlayer() {
    rPlayer = {
        slack_id: r.string(8),
        name: r.string(8),
        team_id: r.string(6),
        team_domain: r.string(6),
        bank: r.integer(2500, 250000),
        lastLobby: null,
        wallet: 0,
        isInLobby: false
    };
    return rPlayer;
}
async function holdForStartUp (){

    return await new Promise(done => setTimeout(done, 1000));//TODO remove after testing
}

const ply = require ('./player/player-router');
const player = require('./player/player-model');

/*createPlayer*/
describe('createPlayer()', function(){
    it('Should create a new player and save it to the db', async function(){
        //console.log(rPlayer);
        //make randomPlayer;
        var rPlayer = makeRandPlayer();
        await ply.createPlayer(rPlayer);
        //get player
        let newPlayer = await player.findOne({slack_id: rPlayer.slack_id, team_id: rPlayer.team_id });
        //console.log(newPlayer);
        //compare contents
        for(var i in newPlayer){
            expect(newPlayer.i).to.equal(rPlayer.i);
        }
    });
});

/*checkIn*/
describe('checkIn()' , function(){
    it('Should have a player joining a lobby by updating player info', async function(){
        //make good checkin data
        var rPlayer = makeRandPlayer();
        var buyin = r.integer(2000,2000000);
        if(buyin > rPlayer.bank){
            buyin = rPlayer.bank;
        }
        var checkin_data = {slack_id: rPlayer.slack_id, team_id: rPlayer.team_id, lobby_id: r.string(6), buyin: buyin };
        //add player to db
        await ply.createPlayer(rPlayer);
        //call
        await ply.checkIn(checkin_data);
        var updPlayerData = await player.findOne({slack_id: checkin_data.slack_id, team_id: checkin_data.team_id });
        //assert
        expect(updPlayerData.bank).to.equal(rPlayer.bank - buyin);
        expect(updPlayerData.wallet).to.equal(buyin);
        expect(updPlayerData.lastLobby).to.equal(checkin_data.lobby_id);
        expect(updPlayerData.isInLobby).to.be.true;
    });
    //TODO add coverage of edge cases
});

/*checkOut*/
describe('checkOut()', function(){
   it("Should remove player from lobby, add wallet to bank, and return updatedPlayer", async function(){
       //make randomChecked in Player
       var rPlayer = makeRandPlayer();
       rPlayer.wallet = Math.floor(rPlayer.bank / r.integer(1,4));
       rPlayer.isInLobby = true;
       //add player to db
       await ply.createPlayer(rPlayer);

       //checkout
       var updatedPlayer = await ply.checkOut(rPlayer);
       //TODO figure out why db returns before player bank can be updated
       //await new Promise(done => setTimeout(done, 1500));//TODO remove after testing
       //updatedPlayer = await ply.getOnePlayer(rPlayer);
       //assert
       //console.log(updatedPlayer.bank);
       expect(updatedPlayer.bank).to.equal(rPlayer.bank + rPlayer.wallet);
       expect(updatedPlayer.wallet).to.equal(0);
       expect(updatedPlayer.isInLobby).to.be.false;

   });
});

/*getOnePlayer*/
describe('getOnePlayer()', function(){
    it("Should return requested player if they exist", async function(){
        //make randomChecked in Player
        var rPlayer = makeRandPlayer();
        //add player to db
        await ply.createPlayer(rPlayer);
        //getPlayer
        var thisPlayer = await ply.getOnePlayer(rPlayer);
        //assert
        expect(thisPlayer.name).to.equal(rPlayer.name);
    });
    it("Should return null if they don't", async function(){
        //make random player, but don't save them
        var rPlayer2 = makeRandPlayer();
        //getPlayer
        var thisPlayer = await ply.getOnePlayer(rPlayer2);
        //assert
        expect(thisPlayer).to.be.null;
    });
});

/*deposit*/
describe('deposit()', function(){
    it("Should update players bank directly from chips", async function(){
        //make randomChecked in Player
        var rPlayer = makeRandPlayer();
        //add player to db
        await ply.createPlayer(rPlayer);
        var chips = r.integer(0,1000000);
        //deposit
        var updatedPlayer = await ply.deposit(rPlayer, chips);
        //assert
        expect(updatedPlayer.bank).to.equal(rPlayer.bank + chips);
    });
});

/*TODO getAllPlayerInLobby*/
//describe('getAllPlayerInLobby()', function(){
//  it("Should ", async function(){
//    });
//});

/**************************************
 * File: lobby-router.js
 * Functions:
 *      getlobbies,
 *      getOneLobby,
 *      createLobby,
 *      updateLobby,
 *      deleteLobby,
 *      deleteLobbyAll,
 *************************************/
function makeRandLobby() {
    var rLobby = {
        name: r.string(8),
        buyin: r.integer(100, 2000000)
    };
    return rLobby;
}
const lobby = require('./lobby/lobby-router');

describe('getLobbies()', function(){
    it('Should return a list of allLobbies', async function(){
        try {
            const lobbyList = await lobby.getlobbies();
            //validate list is of lobbies
            expect(lobbyList[0].name).to.be.a('string');
            expect(lobbyList[0].maxPlayers).to.equal(6);
        }catch (e){
            console.log('getLobbies test: error' + e);
        }

    });
});

/*createLobby*/
describe('createLobby()', function(){
    it('Should create a lobby', async function(){
        //make random lobby
        var rLobby = makeRandLobby();
        var newLobby = await lobby.createLobby(rLobby);
        //assert
        expect(newLobby.name).to.be.equal(rLobby.name);
        expect(newLobby.maxPlayers).to.equal(6);
        expect(newLobby.buyin).to.equal(rLobby.buyin);
    });
});

/*getOneLobby*/
describe('getOneLobby()', function(){
    it('Should return one lobby', async function(){
        var rLobby = makeRandLobby();
        var newLobby = await lobby.createLobby(rLobby);
        //call
        var lobbyToTest = await lobby.getOneLobby(newLobby.id);
        //assert
        expect(lobbyToTest.name).to.equal(rLobby.name);
        expect(lobbyToTest.maxPlayers).to.equal(6);
        expect(lobbyToTest.buyin).to.equal(rLobby.buyin);
    });
});

/*updateLobby TODO REPORT BUG updateLobby is out of sync*/
describe('updateLobby()', function(){
    it('Should return an updated lobby', async function(){
        //create random lobby
        var rLobby = makeRandLobby();
        var newLobby = await lobby.createLobby(rLobby);
        var lobbyToUpdate = await lobby.getOneLobby(newLobby.id);
        //make random modifications
        var rBuyin = r.integer(500, 2000000);

        lobbyToUpdate.name = r.string(8);
        lobbyToUpdate.buyin = rBuyin;
        lobbyToUpdate.maxPlayers = r.integer(2,6);
        lobbyToUpdate.minBet = rBuyin / 25;
        //call
        var lobbyToTest = await lobby.updateLobby(lobbyToUpdate);
        //assert
        expect(lobbyToTest.name).to.equal(lobbyToUpdate.name)
        expect(lobbyToTest.maxPlayers).to.equal(6);
        expect(lobbyToTest.buyin).to.equal(lobbyToUpdate.buyin);
        expect(lobbyToTest.minBet).to.equal(lobbyToUpdate.buyin / 25);
    });
});
/*deleteLobby TODO MORE DEBUGGING*/
describe('deleteLobby()', function(){
    it('Should return a deleted lobby model(?!?)', async function(){
        //create random lobby
        var rLobby = makeRandLobby();
        var newLobby = await lobby.createLobby(rLobby);
        var lobbyToDelete = await lobby.getOneLobby(newLobby.id);
        //make random modifications
        //call
        var lobbyToDelete = await lobby.deleteLobby(lobbyToDelete);
        var deleteCheck = await lobby.getOneLobby(lobbyToDelete.id);
        //assert
        expect(lobbyToDelete).to.not.be.null;
        expect(deleteCheck).to.be.null;
    });
});

/*deleteLobbyAll TODO MORE DEBUGGING*/
describe('deleteLobbyAll()', function(){
    it('Should return an array of deleted lobbies(?!?)', async function(){

        //if no lobbies are available to delete create one
        if(!await lobby.getlobbies()){
            var rLobby = makeRandLobby();
            var newLobby = await lobby.createLobby(rLobby);
            expect(newLobby).to.not.be.null;
        }
        //call
        var lobbyList = await lobby.deleteLobbyAll;
        //console.log(lobbyList);
        //check list is all deleted
        for(var i in lobbyList) {
            var deleteCheck = await lobby.getOneLobby(lobbyList[i].id);
            //assert
            expect(deleteCheck).to.be.null;
        }
    });
});

