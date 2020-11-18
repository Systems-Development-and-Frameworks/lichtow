import { ApolloServer, gql } from "apollo-server";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { InMemoryDataSource, Post } from "./datasource";

const db = new InMemoryDataSource();
db.posts.push(new Post({title: "Test Post"}));

const dataSources = () => ({ db });

const context = ({ req, res }) => ({ req, res });

export default class Server {
    constructor(opts) {
        const defaults = {
            typeDefs,
            resolvers,
            dataSources,
            context,
        };
        return new ApolloServer({ ...defaults, ...opts });
    }
}
