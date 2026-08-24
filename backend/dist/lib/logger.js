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
exports.logger = exports.winstonLogger = void 0;
const env_1 = require("./env");
const os_1 = require("os");
const serialize_error_1 = require("serialize-error");
const triple_beam_1 = require("triple-beam");
const yaml = __importStar(require("yaml"));
const debug_1 = __importDefault(require("debug"));
const deepMap_1 = require("../utils/deepMap");
const _ = __importStar(require("lodash"));
const pc = __importStar(require("picocolors"));
const winston = __importStar(require("winston"));
const omit_1 = require("@ideanick/shared/src/omit");
exports.winstonLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: 'backend', hostEnv: env_1.env.HOST_ENV },
    transports: [
        new winston.transports.Console({
            format: env_1.env.HOST_ENV !== 'local'
                ? winston.format.json()
                : winston.format((logData) => {
                    const setColor = {
                        info: (str) => pc.blue(str),
                        error: (str) => pc.red(str),
                        debug: (str) => pc.cyan(str),
                    }[logData.level];
                    const levelAndType = `${logData.level} ${logData.logType}`;
                    const topMessage = `${setColor(levelAndType)} ${pc.green(logData.timestamp)}${os_1.EOL}${logData.message}`;
                    const visibleMessageTags = (0, omit_1.omit)(logData, [
                        'level',
                        'logType',
                        'timestamp',
                        'message',
                        'service',
                        'hostEnv',
                    ]);
                    const stringifyedLogData = _.trim(yaml.stringify(visibleMessageTags, (_k, v) => (_.isFunction(v) ? 'Function' : v)));
                    const resultLogData = {
                        ...logData,
                        [triple_beam_1.MESSAGE]: [topMessage, Object.keys(visibleMessageTags).length > 0 ? `${os_1.EOL}${stringifyedLogData}` : '']
                            .filter(Boolean)
                            .join('') + os_1.EOL,
                    };
                    return resultLogData;
                })(),
        }),
    ],
});
const prettifyMeta = (meta) => {
    return (0, deepMap_1.deepMap)(meta, ({ key, value }) => {
        if ([
            'email',
            'password',
            'passwordAgain',
            'newPassword',
            'oldPassword',
            'token',
            'text',
            'description',
            'apiKey',
            'signature',
        ].includes(key)) {
            return '🙈';
        }
        return value;
    });
};
exports.logger = {
    info: (logType, message, meta) => {
        if (!debug_1.default.enabled(`ideanick:${logType}`)) {
            return;
        }
        exports.winstonLogger.info(message, { logType, ...prettifyMeta(meta) });
    },
    error: (logType, error, meta) => {
        if (!debug_1.default.enabled(`ideanick:${logType}`)) {
            return;
        }
        const serializedError = (0, serialize_error_1.serializeError)(error);
        exports.winstonLogger.error(serializedError.message || 'Unknown error', {
            logType,
            error,
            errorStack: serializedError.stack,
            ...prettifyMeta(meta),
        });
    },
};
//# sourceMappingURL=logger.js.map