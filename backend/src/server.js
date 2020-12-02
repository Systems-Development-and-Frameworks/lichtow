import { ApolloServer, gql } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "graphql-tools";
import jwt from "jsonwebtoken";
import { InMemoryDataSource, Post, User } from "./datasource";
import { permissions } from "./permissions";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

const db = new InMemoryDataSource();

const dataSources = () => ({ db });

const context = ({ req }) => {
    try {
        const { authorization } = req.headers;
        const token = authorization.replace("Bearer ", "");
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: payload.userId, jwt };
    } catch (e) {
        return { userId: null, jwt };
    }
};
const schema = makeExecutableSchema({ typeDefs, resolvers });

export default class Server {
    constructor(opts) {
        const defaults = {
            schema: applyMiddleware(schema, permissions),
            dataSources,
            context,
        };
        return new ApolloServer({ ...defaults, ...opts });
    }
}
