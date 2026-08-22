"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePublicEnv = void 0;
const parsePublicEnv = (env) => Object.entries(env).reduce((acc, [key, value]) => {
    if (key.startsWith('VITE_') || ['NODE_ENV', 'HOST_ENV', 'SOURCE_VERSION'].includes(key)) {
        return {
            ...acc,
            [key]: value,
        };
    }
    return acc;
}, {});
exports.parsePublicEnv = parsePublicEnv;
//# sourceMappingURL=parsePublicEnv.js.map