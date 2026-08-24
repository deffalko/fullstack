"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zGetIdeaTrpcInput = void 0;
const zod_1 = require("@ideanick/shared/src/zod");
const zod_2 = require("zod");
exports.zGetIdeaTrpcInput = zod_2.z.object({
    ideaNick: zod_1.zStringRequired,
});
//# sourceMappingURL=input.js.map