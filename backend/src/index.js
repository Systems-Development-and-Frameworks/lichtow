const { ApolloServer, gql } = require('apollo-server');
const { typeDefs } = require("./posts/typeDefs");
const { resolvers } = require("./posts/resolvers");

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});