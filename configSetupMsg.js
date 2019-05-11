let reply = [];
const configSetupMsg = (players, data) => {
    let section = {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": "Index - User Name",
            "emoji": true
        }
    };

    let context = {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": "Cards - [Cards here]"
            },
            {
                "type": "mrkdwn",
                "text": "Total Chips - [amount here]"
            },
            {
                "type": "mrkdwn",
                "text": "Chips Bet - [amount here]"
            }
        ]
    };

    let divider = {
        "type": "divider"
    };

    let playerArrSize = data.players.length;
    for (let i = 0; i < playerArrSize; i++) {
        //Section
        let newSection = JSON.parse(JSON.stringify(section));
        newSection.text.text = `${i + 1} - ${players[i].name}`;
        //Content
        let newContent = JSON.parse(JSON.stringify(context));
        //newContent.elements[0].text = `Cards - ${data.players[i].cards[0]} and ${data.players[i].cards[1]}`;
        newContent.elements[0].text = cardTranslator(data.players[i].cards)
        newContent.elements[1].text = `Total Chips - ${data.players[i].chips}`;
        newContent.elements[2].text = `Has Bet - ${data.players[i].chipsBet}`;
        //push both, push divider.

        reply.push(newSection);
        reply.push(newContent);
        reply.push(divider);

    }

    //console.log(reply);
    return reply;
}

const cardTranslator = (cardArray) => {

    const translatedCards = [];

    cardArray.forEach(card => {
        switch (card.type) {

            case "D": type = 'Diamonds';
                break;
            case "C": type = 'Clubs';
                break;
            case "S": type = 'Spades';
                break;
            case "H": type = 'Hearts';
                break;
            default: throw new Error("That aint a type yo.");
        }
        translatedCards.push(`${card.rank} of ${type}`);
    });
    return `${translatedCards[0]} and ${translatedCards[1]}`;
}

// configSetupMsg(players, data);

module.exports = configSetupMsg;