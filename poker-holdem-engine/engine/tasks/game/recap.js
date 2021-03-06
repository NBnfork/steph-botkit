"use strict";

const States = require("../../../domain/player/states");
const task = require("../task");
const isRunning = require("../utils/is-tournament-running");

const sleep = require("../utils/sleep");//TODO remove after testing
const Task = Object.create(task);

Task.name = "RECAP";

Task.shouldRun = isRunning;

Task.run =
  async (LOGGER, { gamestate }) => {
    const message = gamestate.players
      .reduce((msg, player) => {
        msg += player.status === States.get("out")
          ? `* ${player.name} is out.\n`
          : `* ${player.name} has bet ${player.chipsBet} (${player.state}).\n`;

        return msg;
      }, "");

    LOGGER.info(`State after betting session:\n${message.trim()}`, { tag: gamestate.handUniqueId });
    await new Promise(done => setTimeout(done, 72000));//TODO remove after testing
  };

module.exports = Task;
