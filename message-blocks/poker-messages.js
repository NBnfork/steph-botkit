const showdown_mockup = [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "SHOW DOWN."
        }
    },
    {
        "type": "image",
        "title": {
            "type": "plain_text",
            "text": "All cards revealed!",
            "emoji": true
        },
        "image_url": "https://i.imgur.com/ceTQ9vF.jpg",
        "alt_text": "All cards revealed! "
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Your Best Combo:*\n Stephanie : *TWO PAIRS*"
        },
        "accessory": {
            "type": "image",
            "image_url": "https://i.imgur.com/rqxxJsZ.jpg",
            "alt_text": "computer thumbnail"
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Game Over!* Stephanie has lost the game to Noah, who had *ROYAL FLUSH* !"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": "Until the next game! :smile: :beer:",
            "emoji": true
        }
    }
];

module.exports = {
    showdown_mockup
}