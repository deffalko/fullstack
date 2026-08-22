"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./lib/env");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const ctx_1 = require("./lib/ctx");
const passport_1 = require("./lib/passport");
const trpc_1 = require("./lib/trpc");
const router_1 = require("./router");
const presetDb_1 = require("./scripts/presetDb");
const emails_1 = require("./lib/emails");
const cron_1 = require("./lib/cron");
const logger_1 = require("./lib/logger");
const rollbar_1 = require("./lib/rollbar");
const serveWebApp_1 = require("./lib/serveWebApp");
void (async () => {
    let ctx = null;
    try {
        (0, rollbar_1.initRollbar)();
        ctx = (0, ctx_1.createAppContext)();
        await (0, presetDb_1.presetDb)(ctx);
        // Создаем ОДИН экземпляр приложения
        const expressApp = (0, express_1.default)();
        // Middleware
        expressApp.use((0, cors_1.default)());
        expressApp.use(express_1.default.json()); // ✅ Добавляем парсинг JSON
        // Простые endpoints
        expressApp.get('/ping', (req, res) => {
            res.send('pong');
        });
        // ============================================
        // ТЕСТОВЫЙ ENDPOINT ДЛЯ ОТПРАВКИ ПИСЕМ
        // ============================================
        expressApp.post('/api/test-email', async (req, res) => {
            try {
                const { email, nick, ideaNick, type } = req.body;
                console.log('📧 Test email request:', { email, nick, ideaNick, type });
                // Валидация email
                if (!email) {
                    return res.status(400).json({
                        error: 'Email is required. Example: {"email":"test@gmail.com"}',
                    });
                }
                let result;
                let message;
                if (type === 'blocked') {
                    // Отправляем blocked email
                    result = await (0, emails_1.sendIdeaBlockedEmail)({
                        user: { email },
                        idea: { nick: ideaNick || 'TestIdea' },
                    });
                    message = `Blocked email sent to ${email} for idea "${ideaNick || 'TestIdea'}"`;
                    console.log('✅ Blocked email sent to:', email);
                }
                else {
                    // Отправляем welcome email (по умолчанию)
                    result = await (0, emails_1.sendWelcomeEmail)({
                        user: {
                            email,
                            nick: nick || 'TestUser',
                        },
                    });
                    message = `Welcome email sent to ${email} for user "${nick || 'TestUser'}"`;
                    console.log('✅ Welcome email sent to:', email);
                }
                res.json({
                    success: true,
                    message,
                    result,
                    sentAt: new Date().toISOString(),
                });
            }
            catch (error) {
                console.error('❌ Error sending test email:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to send email',
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
        // Passport и tRPC
        (0, passport_1.applyPassportToExpressApp)(expressApp, ctx);
        await (0, trpc_1.applyTrpcToExpressApp)(expressApp, ctx, router_1.trpcRouter);
        await (0, serveWebApp_1.applyServeWebApp)(expressApp);
        (0, cron_1.applyCron)(ctx);
        expressApp.use((error, req, res, next) => {
            logger_1.logger.error('express', error);
            if (res.headersSent) {
                next(error);
                return;
            }
            res.status(500).send('Internal server error');
        });
        // Запуск сервера
        expressApp.listen(env_1.env.PORT, () => {
            logger_1.logger.info('express', `🚀 Listening at http://localhost:${env_1.env.PORT}`);
            console.info(`📧 Test email endpoint: http://localhost:${env_1.env.PORT}/api/test-email`);
            console.info(`🏥 Health check: http://localhost:${env_1.env.PORT}/ping`);
        });
    }
    catch (error) {
        // console.error(error)
        logger_1.logger.error('app', error);
        await ctx?.stop();
    }
})();
//# sourceMappingURL=index.js.map