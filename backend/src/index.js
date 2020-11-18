import { ApolloServer, gql } from "apollo-server";
import typeDefs from "./typeDefs";
import resolvers  from "./resolvers";
import { PostDataSource } from "./posts/datasource";

const dataSources = {
    postDatasource: new PostDataSource(),
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
        return dataSources;
    },
});

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
