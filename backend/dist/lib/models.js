"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toClientMe = void 0;
const pick_1 = require("@ideanick/shared/src/pick");
const toClientMe = (user) => {
    return user && (0, pick_1.pick)(user, ['id', 'nick', 'name', 'permissions', 'email', 'avatar']);
};
exports.toClientMe = toClientMe;
//# sourceMappingURL=models.js.map