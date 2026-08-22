"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('./brevo', () => {
    const original = jest.requireActual('./brevo');
    const mockedSendEmailThroughBrevo = jest.fn(async () => {
        return {
            loggableResponse: {
                status: 200,
                statusText: 'OK',
                data: { message: 'Mocked' },
            },
        };
    });
    return {
        ...original,
        sendEmailThroughBrevo: mockedSendEmailThroughBrevo,
    };
});
//# sourceMappingURL=brevo.mock.js.map