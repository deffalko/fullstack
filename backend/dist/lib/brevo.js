"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailThroughBrevo = void 0;
const env_1 = require("./env");
const axios_1 = __importDefault(require("axios"));
const pick_1 = require("@ideanick/shared/dist/pick");
const makeRequestToBrevo = async ({ path, data, }) => {
    if (!env_1.env.BREVO_API_KEY) {
        return {
            loggableResponse: {
                status: 200,
                statusText: 'OK',
                data: { message: 'BREVO_API_KEY is not set' },
            },
        };
    }
    const response = await (0, axios_1.default)({
        method: 'POST',
        url: `https://api.brevo.com/v3/${path}`,
        headers: {
            accept: 'application/json',
            'api-key': env_1.env.BREVO_API_KEY,
            'content-type': 'application/json',
        },
        data,
    });
    return {
        originalResponse: response,
        loggableResponse: (0, pick_1.pick)(response, ['status', 'statusText', 'data']),
    };
};
const sendEmailThroughBrevo = async ({ to, subject, html }) => {
    return await makeRequestToBrevo({
        path: 'smtp/email',
        data: {
            subject,
            htmlContent: html,
            sender: { email: env_1.env.FROM_EMAIL_ADDRESS, name: env_1.env.FROM_EMAIL_NAME },
            to: [{ email: to }],
        },
    });
};
exports.sendEmailThroughBrevo = sendEmailThroughBrevo;
//# sourceMappingURL=brevo.js.map