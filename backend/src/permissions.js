import { rule, shield } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, ctx, info) => {
    return ctx.userId !== null;
});
const allow = rule({ cache: "contextual" })(async (parent, args, ctx, info) => true);

export const permissions = shield(
    {
        Mutation: {
            signup: allow,
            login: allow,
        },
    },
    {
        allowExternalErrors: true,
        fallbackRule: isAuthenticated,
    }
);
