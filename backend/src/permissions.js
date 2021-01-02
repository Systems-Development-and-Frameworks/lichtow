import { allow, rule, shield } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, ctx, info) => {
    return ctx.userId !== null;
});

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
