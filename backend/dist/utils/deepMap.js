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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMap = void 0;
// import _ from 'lodash'
const _ = __importStar(require("lodash"));
const recursion = ({ input, replaceFn, seen, pathStartsWith, parentKey, }) => {
    if (['object', 'function', 'symbol'].includes(typeof input) && input !== null) {
        if (seen.has(input)) {
            return '!!!CIRCULAR!!!';
        }
        else {
            seen.add(input);
        }
    }
    const result = replaceFn({ path: pathStartsWith.replace(/\.$/, ''), key: parentKey, value: input });
    if (!result) {
        return result;
    }
    if (_.isArray(result)) {
        return result.map((item, index) => recursion({
            input: item,
            replaceFn,
            seen,
            pathStartsWith: `${pathStartsWith}${index}.`,
            parentKey: index.toString(),
        }));
    }
    if (_.isObject(result)) {
        const object = {};
        for (const [key, value] of Object.entries(result)) {
            object[key] = recursion({
                input: value,
                replaceFn,
                seen,
                pathStartsWith: `${pathStartsWith}${key}.`,
                parentKey: key,
            });
        }
        return object;
    }
    return result;
};
const deepMap = (input, replaceFn) => {
    const seen = new WeakSet();
    const mappedObject = recursion({ input, replaceFn, seen, pathStartsWith: '', parentKey: '' });
    const clonedMappedObject = _.cloneDeep(mappedObject);
    return clonedMappedObject;
};
exports.deepMap = deepMap;
//# sourceMappingURL=deepMap.js.map