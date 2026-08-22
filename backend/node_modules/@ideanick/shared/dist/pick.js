"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = void 0;
const pick_1 = __importDefault(require("lodash/pick"));
const pick = (obj, keys) => {
    return (0, pick_1.default)(obj, keys);
};
exports.pick = pick;
//# sourceMappingURL=pick.js.map