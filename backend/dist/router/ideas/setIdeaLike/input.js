"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zSetIdeaLikeIdeaTrpcInput = void 0;
const zod_1 = require("zod");
const zod_2 = require("@ideanick/shared/src/zod");
exports.zSetIdeaLikeIdeaTrpcInput = zod_1.z.object({
    ideaId: zod_2.zStringRequired,
    isLikedByMe: zod_1.z.boolean(),
});
//# sourceMappingURL=input.js.map