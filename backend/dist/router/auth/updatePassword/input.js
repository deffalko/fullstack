"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zUpdatePasswordTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/dist/zod");
exports.zUpdatePasswordTrpcInput = zod_1.z.object({
    oldPassword: zod_2.zStringRequired,
    newPassword: zod_2.zStringRequired,
});
//# sourceMappingURL=input.js.map