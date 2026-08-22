"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zCreateIdeaTrpcInput = void 0;
const zod_1 = require("@ideanick/shared/dist/zod");
const zod_2 = require("zod");
exports.zCreateIdeaTrpcInput = zod_2.z.object({
    name: zod_1.zStringRequired,
    nick: zod_1.zNickRequired,
    description: zod_1.zStringRequired,
    text: (0, zod_1.zStringMin)(100),
    images: zod_2.z.array(zod_1.zStringRequired),
});
//# sourceMappingURL=input.js.map