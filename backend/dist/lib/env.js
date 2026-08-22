"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("@ideanick/shared/src/zod");
const dotenv = __importStar(require("dotenv"));
const zod_2 = require("zod");
const findEnvFilePath = (dir, pathPart) => {
    const maybeEnvFilePath = path_1.default.join(dir, pathPart);
    if (fs_1.default.existsSync(maybeEnvFilePath)) {
        return maybeEnvFilePath;
    }
    if (dir === '/') {
        return null;
    }
    return findEnvFilePath(path_1.default.dirname(dir), pathPart);
};
const webappEnvFilePath = findEnvFilePath(__dirname, 'webapp/.env');
if (webappEnvFilePath) {
    dotenv.config({ path: webappEnvFilePath, override: true });
    dotenv.config({ path: `${webappEnvFilePath}.${process.env.NODE_ENV}`, override: true });
}
const backendEnvFilePath = findEnvFilePath(__dirname, 'backend/.env');
if (backendEnvFilePath) {
    dotenv.config({ path: backendEnvFilePath, override: true });
    dotenv.config({ path: `${backendEnvFilePath}.${process.env.NODE_ENV}`, override: true });
}
const zEnv = zod_2.z.object({
    NODE_ENV: zod_2.z.enum(['test', 'development', 'production']),
    PORT: zod_1.zEnvNonemptyTrimmed,
    HOST_ENV: zod_1.zEnvHost,
    DATABASE_URL: zod_1.zEnvNonemptyTrimmed.refine((val) => {
        if (process.env.NODE_ENV !== 'test') {
            return true;
        }
        const [databaseUrl] = val.split('?');
        const [databaseName] = databaseUrl.split('/').reverse();
        return databaseName.endsWith('-test');
    }, `Data base name should ends with "-test" on test environment`),
    JWT_SECRET: zod_1.zEnvNonemptyTrimmed,
    PASSWORD_SALT: zod_1.zEnvNonemptyTrimmed,
    INITIAL_ADMIN_PASSWORD: zod_1.zEnvNonemptyTrimmed,
    WEBAPP_URL: zod_1.zEnvNonemptyTrimmed,
    BREVO_API_KEY: zod_1.zEnvNonemptyTrimmedRequiredOnNotLocal,
    FROM_EMAIL_NAME: zod_1.zEnvNonemptyTrimmed,
    FROM_EMAIL_ADDRESS: zod_1.zEnvNonemptyTrimmed,
    CLOUDINARY_API_KEY: zod_1.zEnvNonemptyTrimmedRequiredOnNotLocal,
    CLOUDINARY_API_SECRET: zod_1.zEnvNonemptyTrimmedRequiredOnNotLocal,
    CLOUDINARY_CLOUD_NAME: zod_1.zEnvNonemptyTrimmed,
    DEBUG: zod_2.z
        .string()
        .optional()
        .refine((val) => process.env.HOST_ENV === 'local' || process.env.NODE_ENV !== 'production' || (!!val && val.length > 0), 'Required on not local host on production'),
});
exports.env = zEnv.parse(process.env);
//# sourceMappingURL=env.js.map