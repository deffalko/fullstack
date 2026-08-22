"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMostLikedIdeasEmail = exports.sendIdeaBlockedEmail = exports.sendWelcomeEmail = void 0;
const routes_1 = require("@ideanick/webapp/src/lib/routes");
const utils_1 = require("./utils");
/**
 * Отправка приветственного письма при регистрации
 */
const sendWelcomeEmail = async ({ user }) => {
    console.log(`📧 Отправка welcome email для пользователя: ${user.email}`);
    return await (0, utils_1.sendEmail)({
        to: user.email,
        subject: 'Thanks For Registration!',
        templateName: 'welcome',
        templateVariables: {
            userNick: user.nick,
            addIdeaUrl: (0, routes_1.getNewIdeaRoute)({ abs: true }),
        },
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
/**
 * Отправка письма о блокировке идеи
 */
const sendIdeaBlockedEmail = async ({ user, idea }) => {
    console.log(`📧 Отправка idea blocked email для пользователя: ${user.email}`);
    return await (0, utils_1.sendEmail)({
        to: user.email,
        subject: 'Your Idea Blocked!',
        templateName: 'ideaBlocked',
        templateVariables: {
            ideaNick: idea.nick,
        },
    });
};
exports.sendIdeaBlockedEmail = sendIdeaBlockedEmail;
/**
 * Отправка письма с самыми популярными идеями
 */
const sendMostLikedIdeasEmail = async ({ user, ideas, }) => {
    return await (0, utils_1.sendEmail)({
        to: user.email,
        subject: 'Most Liked Ideas!',
        templateName: 'mostLikedIdeas',
        templateVariables: {
            ideas: ideas.map((idea) => ({
                name: idea.name,
                url: (0, routes_1.getViewIdeaRoute)({ abs: true, ideaNick: idea.nick }),
            })),
        },
    });
};
exports.sendMostLikedIdeasEmail = sendMostLikedIdeasEmail;
//# sourceMappingURL=index.js.map