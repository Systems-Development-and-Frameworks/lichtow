import { ApolloServer, gql } from "apollo-server";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { InMemoryDataSource, Post, User } from "./datasource";

const db = new InMemoryDataSource();
db.posts.push(new Post({ title: "Test Post", authorName: "Jonas" }));
db.users.push(new User("Jonas"), new User("Paula"));

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
