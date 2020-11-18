const { ApolloServer, gql } = require("apollo-server");

const resolvers = {
    Query: {
        posts: (_sources, _args, context) => context.dataSources.postDatasource.allPosts(),
    },
};

export default resolvers;
