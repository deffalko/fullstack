"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpectedError = void 0;
class ExpectedError extends Error {
    constructor() {
        super(...arguments);
        this.isExpected = true;
    }
}
exports.ExpectedError = ExpectedError;
//# sourceMappingURL=error.js.map