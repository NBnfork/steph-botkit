const Tournament = require("poker-holdem-engine");

const tournamentID = "slackParty";

const players = [
    {
        id: "001",
        name: "Stephanie",
        serviceUrl: "https://e20c063e.ngrok.io"
    },
    {
        id: "002",
        name: "Noah",
        serviceUrl: "https://e20c063e.ngrok.io"
    },
    {
        id: "003",
        name: "Brian",
        serviceUrl: "https://e20c063e.ngrok.io"
    },
    {
        id: "004",
        name: "Angry Poker Dude",
        serviceUrl: "https://e20c063e.ngrok.io"
    },
];

tournamentSettings = {
    "BUYIN": 100,
    "WARMUP": false,
    "WARMUP_GAME": 10,
    "WARMUP_TIME": 10,
    "HAND_THROTTLE_TIME": 1,
    "SMALL_BLINDS": [50, 100, 200, 250],
    "SMALL_BLINDS_PERIOD": 1,
    "PAY_ANTE_AT_HAND": 1,
    "MAX_GAMES": 1,
    "POINTS": [
        [10, 2, 0, 0]
    ]
    // Read docs/game-settings.md for the available configuration options.
};


process.on("message", (msg) => {

    switch (msg.topic) {
        case "create":
            console.log("Got 'create'! ,, creating...")
            //const startGame = () => {
            const t = new Tournament(tournamentID, players, tournamentSettings, { autoStart: true, });
            //console.log('In create, ', bot);
            t.on("TOURNAMENT:updated", (data, done) => {

                done();
                process.send({ topic: data });
                process.send({ topic: "exit" });

            });
            break;
        default:
            console.log(`Logging! [${msg.topic}] ----- ${msg.message}...`)
    }
});
