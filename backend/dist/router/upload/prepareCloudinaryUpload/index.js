"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareCloudinaryUploadTrpcRoute = void 0;
const cloudinary_1 = require("@ideanick/shared/src/cloudinary");
const cloudinary_2 = require("cloudinary");
const env_1 = require("../../../lib/env");
const trpc_1 = require("../../../lib/trpc");
const input_1 = require("./input");
exports.prepareCloudinaryUploadTrpcRoute = trpc_1.trpcLoggedProcedure
    .input(input_1.zPrepareCloudinaryUploadTrpcInput)
    .mutation(async ({ input }) => {
    if (!env_1.env.CLOUDINARY_API_SECRET) {
        throw new Error('CLOUDINARY_API_SECRET is missing');
    }
    if (!env_1.env.CLOUDINARY_API_KEY) {
        throw new Error('CLOUDINARY_API_KEY is missing');
    }
    const uploadType = cloudinary_1.cloudinaryUploadTypes[input.type];
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = uploadType.folder;
    const transformation = uploadType.transformation;
    const eager = Object.values(uploadType.presets).join('|');
    const signature = cloudinary_2.v2.utils.api_sign_request({
        timestamp,
        folder,
        transformation,
        eager,
    }, env_1.env.CLOUDINARY_API_SECRET);
    return {
        preparedData: {
            timestamp: `${timestamp}`,
            folder,
            transformation,
            eager,
            signature,
            apiKey: env_1.env.CLOUDINARY_API_KEY,
            url: `https://api.cloudinary.com/v1_1/${env_1.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
        },
    };
});
//# sourceMappingURL=index.js.map