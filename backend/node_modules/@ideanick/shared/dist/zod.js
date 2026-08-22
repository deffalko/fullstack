"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zPasswordsMustBeTheSame = exports.zStringMin = exports.zNickRequired = exports.zEmailRequired = exports.zStringOptional = exports.zStringRequired = exports.zEnvHost = exports.zEnvNonemptyTrimmedRequiredOnNotLocal = exports.zEnvNonemptyTrimmed = void 0;
const zod_1 = require("zod");
exports.zEnvNonemptyTrimmed = zod_1.z.string().trim().min(1);
exports.zEnvNonemptyTrimmedRequiredOnNotLocal = exports.zEnvNonemptyTrimmed.optional().refine(
// eslint-disable-next-line node/no-process-env
(val) => `${process.env.HOST_ENV}` === 'local' || !!val, 'Required on not local host');
exports.zEnvHost = zod_1.z.enum(['local', 'production']);
exports.zStringRequired = zod_1.z.string({ required_error: 'Please, fill it' }).min(1, 'Please, fill it');
exports.zStringOptional = zod_1.z.string().optional();
exports.zEmailRequired = exports.zStringRequired.email();
exports.zNickRequired = exports.zStringRequired.regex(/^[a-z0-9-]+$/, 'Nick may contain only lowercase letters, numbers and dashes');
const zStringMin = (min) => exports.zStringRequired.min(min, `Text should be at least ${min} characters long`);
exports.zStringMin = zStringMin;
const zPasswordsMustBeTheSame = (passwordFieldName, passwordAgainFieldName) => (val, ctx) => {
    if (val[passwordFieldName] !== val[passwordAgainFieldName]) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Passwords must be the same',
            path: [passwordAgainFieldName],
        });
    }
};
exports.zPasswordsMustBeTheSame = zPasswordsMustBeTheSame;
//# sourceMappingURL=zod.js.map