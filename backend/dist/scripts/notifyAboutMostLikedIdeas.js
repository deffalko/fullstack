"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAboutMostLikedIdeas = exports.getMostLikedIdeas = void 0;
const client_1 = require("@prisma/client");
const emails_1 = require("../lib/emails");
const rollbar_1 = require("../lib/rollbar");
const getMostLikedIdeas = async ({ ctx, limit = 10, now }) => {
    (0, rollbar_1.rollbarCaptureException)(new Error('oops'));
    const sqlNow = now ? client_1.Prisma.sql `${now.toISOString()}::timestamp` : client_1.Prisma.sql `now()`;
    return await ctx.prisma.$queryRaw `
  with "topIdeas" as (
    select id,
      nick,
      name,
      (
        select count(*)::int
        from "IdeaLike" il
        where il."ideaId" = i.id
          and il."createdAt" > ${sqlNow} - interval '1 month'
          and i."blockedAt" is null
      ) as "thisMonthLikesCount"
    from "Idea" i
    order by "thisMonthLikesCount" desc
    limit ${limit}
  )
  select *
  from "topIdeas"
  where "thisMonthLikesCount" > 0
`;
};
exports.getMostLikedIdeas = getMostLikedIdeas;
const notifyAboutMostLikedIdeas = async ({ ctx, limit, now, }) => {
    const mostLikedIdeas = await (0, exports.getMostLikedIdeas)({ ctx, limit, now });
    if (!mostLikedIdeas.length) {
        return;
    }
    const users = await ctx.prisma.user.findMany({
        select: {
            email: true,
        },
    });
    for (const user of users) {
        await (0, emails_1.sendMostLikedIdeasEmail)({ user, ideas: mostLikedIdeas });
    }
};
exports.notifyAboutMostLikedIdeas = notifyAboutMostLikedIdeas;
//# sourceMappingURL=notifyAboutMostLikedIdeas.js.map