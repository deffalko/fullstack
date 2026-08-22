"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedEnv = void 0;
/* eslint-disable node/no-process-env */
const zod_1 = require("zod");
const zod_2 = require("./zod");
const windowEnv = typeof webappEnvFromBackend !== 'undefined' ? webappEnvFromBackend : {};
const getSharedEnvVariable = (key) => windowEnv[`VITE_${key}`] || windowEnv[key] || process.env[`VITE_${key}`] || process.env[key];
const sharedEnvRaw = {
    // CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_CLOUD_NAME: getSharedEnvVariable('CLOUDINARY_CLOUD_NAME'),
    S3_URL: getSharedEnvVariable('S3_URL'),
    WEBAPP_URL: getSharedEnvVariable('WEBAPP_URL'),
};
const zEnv = zod_1.z.object({
    WEBAPP_URL: zod_2.zEnvNonemptyTrimmed,
    CLOUDINARY_CLOUD_NAME: zod_2.zEnvNonemptyTrimmed,
    S3_URL: zod_2.zEnvNonemptyTrimmed,
});
exports.sharedEnv = zEnv.parse(sharedEnvRaw);
//# sourceMappingURL=env.js.map