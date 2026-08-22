"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCron = void 0;
const cron_1 = require("cron");
const notifyAboutMostLikedIdeas_1 = require("../scripts/notifyAboutMostLikedIdeas");
const logger_1 = require("./logger");
const applyCron = (ctx) => {
    new cron_1.CronJob('0 10 1 * *', // At 10:00 on day-of-month 1
    () => {
        (0, notifyAboutMostLikedIdeas_1.notifyAboutMostLikedIdeas)({ ctx }).catch(logger_1.winstonLogger.error);
    }, null, // onComplete
    true // start right now
    );
};
exports.applyCron = applyCron;
//# sourceMappingURL=cron.js.map