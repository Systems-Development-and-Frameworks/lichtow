const { ApolloServer, gql } = require("apollo-server");
const { typeDefs } = require("./posts/typeDefs");
const { resolvers } = require("./posts/resolvers");
const { PostDataSource } = require("./posts/datasource");

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
