import { ApolloServer, gql } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import jwt from "jsonwebtoken";
import neo4j from "neo4j-driver";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import { stitchSchemas } from "@graphql-tools/stitch";
import { Neo4JDataSource, Post, User } from "./datasource";
import { permissions } from "./permissions";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";


const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

const schema = makeAugmentedSchema({ typeDefs });
const db = new Neo4JDataSource({ subSchema: schema });
const stitchedSchema = stitchSchemas({
    subschemas: [schema],
    typeDefs,
    resolvers,
});

const personName = "PasswordUser";
const result = session.run("CREATE (a:User {name: $name, email: $email, password: $password}) RETURN a", {
    name: personName,
    email: "mail@mail.com",
    password: "superPassword",
});

const dataSources = () => ({ db });

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
            dataSources,
            context,
        };
        return new ApolloServer({ ...defaults, ...opts });
    }
}
