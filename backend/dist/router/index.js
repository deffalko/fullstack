"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcRouter = void 0;
const trpc_1 = require("../lib/trpc");
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
const getMe_1 = require("./auth/getMe");
const signIn_1 = require("./auth/signIn");
const signUp_1 = require("./auth/signUp");
const updatePassword_1 = require("./auth/updatePassword");
const updateProfile_1 = require("./auth/updateProfile");
const blockIdea_1 = require("./ideas/blockIdea");
const createIdea_1 = require("./ideas/createIdea");
const getIdea_1 = require("./ideas/getIdea");
const getIdeas_1 = require("./ideas/getIdeas");
const setIdeaLike_1 = require("./ideas/setIdeaLike");
const updateIdea_1 = require("./ideas/updateIdea");
const prepareCloudinaryUpload_1 = require("./upload/prepareCloudinaryUpload");
// @endindex
exports.trpcRouter = (0, trpc_1.createTrpcRouter)({
    // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
    getMe: getMe_1.getMeTrpcRoute,
    signIn: signIn_1.signInTrpcRoute,
    signUp: signUp_1.signUpTrpcRoute,
    updatePassword: updatePassword_1.updatePasswordTrpcRoute,
    updateProfile: updateProfile_1.updateProfileTrpcRoute,
    blockIdea: blockIdea_1.blockIdeaTrpcRoute,
    createIdea: createIdea_1.createIdeaTrpcRoute,
    getIdea: getIdea_1.getIdeaTrpcRoute,
    getIdeas: getIdeas_1.getIdeasTrpcRoute,
    setIdeaLike: setIdeaLike_1.setIdeaLikeTrpcRoute,
    updateIdea: updateIdea_1.updateIdeaTrpcRoute,
    prepareCloudinaryUpload: prepareCloudinaryUpload_1.prepareCloudinaryUploadTrpcRoute,
    // @endindex
});
//# sourceMappingURL=index.js.map