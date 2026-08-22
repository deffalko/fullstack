"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canEditIdea = exports.canBlockIdeas = exports.hasPermission = void 0;
const hasPermission = (user, permission) => {
    return user?.permissions.includes(permission) || user?.permissions.includes('ALL') || false;
};
exports.hasPermission = hasPermission;
const canBlockIdeas = (user) => {
    return (0, exports.hasPermission)(user, 'BLOCK_IDEAS');
};
exports.canBlockIdeas = canBlockIdeas;
const canEditIdea = (user, idea) => {
    return !!user && !!idea && user?.id === idea?.authorId;
};
exports.canEditIdea = canEditIdea;
//# sourceMappingURL=can.js.map