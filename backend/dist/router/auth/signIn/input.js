"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zSignInTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/src/zod");
exports.zSignInTrpcInput = zod_1.z.object({
    nick: zod_2.zStringRequired,
    password: zod_2.zStringRequired,
});
//# sourceMappingURL=input.js.map