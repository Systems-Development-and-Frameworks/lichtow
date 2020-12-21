import { ApolloServer, gql } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import jwt from "jsonwebtoken";
import { stitchSchemas } from "@graphql-tools/stitch";
import { permissions } from "./permissions";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import neo4jSchema, { driver } from "./neo4jSchema";

const customResolvers = resolvers({ subschema: neo4jSchema });

const stitchedSchema = stitchSchemas({
    subschemas: [neo4jSchema],
    // if you want to expose neo4j-graphql-js auto-generated resolvers only in
    // development, you could do:
    //   subschemas: (process.env.NODE_ENV === 'development' ? [neo4jSchema] : []),
    resolvers: customResolvers,
    typeDefs,
});

const context = ({ req }) => {
    try {
        const { authorization } = req.headers;
        const token = authorization.replace("Bearer ", "");
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: payload.userId, jwt, driver };
    } catch (e) {
        return { userId: null, jwt, driver };
    }
};

export default class Server {
    constructor(opts) {
        const defaults = {
            schema: applyMiddleware(stitchedSchema, permissions),
            context,
        };
        return new ApolloServer({ ...defaults, ...opts });
    }
}
