"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyServeWebApp = void 0;
const env_1 = require("./env");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// import { parsePublicEnv } from '@ideanick/webapp/src/lib/parsePublicEnv'
const express_1 = __importDefault(require("express"));
const logger_1 = require("./logger");
const parsePublicEnv_1 = require("./parsePublicEnv");
// import { parsePublicEnv } from '../../../webapp/src/lib/parsePublicEnv'
const checkFileExists = async (filePath) => {
    return await fs_1.promises
        .access(filePath, fs_1.promises.constants.F_OK)
        .then(() => true)
        .catch(() => false);
};
const findWebappDistDir = async (dir) => {
    const maybeWebappDistDir = path_1.default.resolve(dir, 'webapp/dist');
    if (await checkFileExists(maybeWebappDistDir)) {
        return maybeWebappDistDir;
    }
    if (dir === '/') {
        return null;
    }
    return await findWebappDistDir(path_1.default.dirname(dir));
};
const applyServeWebApp = async (expressApp) => {
    const webappDistDir = await findWebappDistDir(__dirname);
    if (!webappDistDir) {
        if (env_1.env.HOST_ENV === 'production') {
            throw new Error('Webapp dist dir not found');
        }
        else {
            logger_1.logger.error('webapp-serve', 'Webapp dist dir not found');
            return;
        }
    }
    const htmlSource = await fs_1.promises.readFile(path_1.default.resolve(webappDistDir, 'index.html'), 'utf8');
    // eslint-disable-next-line node/no-process-env
    const publicEnv = (0, parsePublicEnv_1.parsePublicEnv)(process.env);
    const htmlSourceWithEnv = htmlSource.replace('{ replaceMeWithPublicEnv: true }', JSON.stringify(publicEnv, null, 2));
    expressApp.use(express_1.default.static(webappDistDir, { index: false }));
    expressApp.get('/*', (req, res) => {
        res.send(htmlSourceWithEnv);
    });
};
exports.applyServeWebApp = applyServeWebApp;
//# sourceMappingURL=serveWebApp.js.map