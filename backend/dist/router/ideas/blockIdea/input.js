"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zBlockIdeaTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/dist/zod");
exports.zBlockIdeaTrpcInput = zod_1.z.object({
    ideaId: zod_2.zStringRequired,
});
//# sourceMappingURL=input.js.map