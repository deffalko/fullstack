"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.omit = void 0;
const omit_1 = __importDefault(require("lodash/omit"));
const omit = (obj, keys) => {
    return (0, omit_1.default)(obj, keys);
};
exports.omit = omit;
//# sourceMappingURL=omit.js.map