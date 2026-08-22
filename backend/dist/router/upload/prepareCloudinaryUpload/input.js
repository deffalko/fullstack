"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zPrepareCloudinaryUploadTrpcInput = void 0;
const cloudinary_1 = require("@ideanick/shared/dist/cloudinary");
const getKeysAsArray_1 = require("@ideanick/shared/dist/getKeysAsArray");
const zod_1 = require("zod");
exports.zPrepareCloudinaryUploadTrpcInput = zod_1.z.object({
    type: zod_1.z.enum((0, getKeysAsArray_1.getKeysAsArray)(cloudinary_1.cloudinaryUploadTypes)),
});
//# sourceMappingURL=input.js.map