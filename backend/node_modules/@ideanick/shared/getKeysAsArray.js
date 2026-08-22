"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeysAsArray = void 0;
const keys_1 = __importDefault(require("lodash/keys"));
const getKeysAsArray = (obj) => {
    return (0, keys_1.default)(obj);
};
exports.getKeysAsArray = getKeysAsArray;
//# sourceMappingURL=getKeysAsArray.js.map