"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zSignUpTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/dist/zod");
exports.zSignUpTrpcInput = zod_1.z.object({
    nick: zod_2.zNickRequired,
    email: zod_2.zEmailRequired,
    password: zod_2.zStringRequired,
});
//# sourceMappingURL=input.js.map