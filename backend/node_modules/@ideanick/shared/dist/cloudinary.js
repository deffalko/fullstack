"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatarUrl = exports.getCloudinaryUploadUrl = exports.cloudinaryUploadTypes = void 0;
const env_1 = require("./env");
const cloudinaryUrl = `https://res.cloudinary.com/${env_1.sharedEnv.CLOUDINARY_CLOUD_NAME}/image/upload`;
exports.cloudinaryUploadTypes = {
    avatar: {
        folder: 'avatars',
        transformation: 'w_400,h_400,c_fill',
        format: 'png',
        presets: {
            small: 'w_200,h_200,c_fill',
            big: 'w_400,h_400,c_fill',
        },
    },
    image: {
        folder: 'images',
        transformation: 'w_1000,h_1000,c_limit',
        format: 'jpg',
        presets: {
            preview: 'w_200,h_200,c_fit,q_80',
            large: 'w_1000,h_1000,c_limit,q_80',
        },
    },
};
const getCloudinaryUploadUrl = (publicId, typeName, presetName) => {
    const type = exports.cloudinaryUploadTypes[typeName];
    const preset = type.presets[presetName];
    return `${cloudinaryUrl}/${preset}/${publicId}`;
};
exports.getCloudinaryUploadUrl = getCloudinaryUploadUrl;
const getAvatarUrl = (publicId, preset) => publicId
    ? (0, exports.getCloudinaryUploadUrl)(publicId, 'avatar', preset)
    : (0, exports.getCloudinaryUploadUrl)('v1786219549/avatar_placeholders_l0cccr.webp', 'avatar', preset);
exports.getAvatarUrl = getAvatarUrl;
//# sourceMappingURL=cloudinary.js.map