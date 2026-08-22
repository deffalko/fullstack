"use strict";
// import { type sendEmail } from './utils'
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('./utils', () => {
    const original = jest.requireActual('./utils');
    const mockedSendEmail = jest.fn(async () => {
        return {
            ok: true,
        };
    });
    return {
        ...original,
        sendEmail: mockedSendEmail,
    };
});
//# sourceMappingURL=utils.mock.js.map