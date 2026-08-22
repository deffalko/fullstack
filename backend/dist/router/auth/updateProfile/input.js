"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zUpdateProfileTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/src/zod");
exports.zUpdateProfileTrpcInput = zod_1.z.object({
    nick: zod_2.zNickRequired,
    name: zod_1.z.string().max(50).default(''),
    avatar: zod_1.z.string().nullable(),
});
//# sourceMappingURL=input.js.map