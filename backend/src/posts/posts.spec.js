const { ApolloServer, gql } = require("apollo-server");
const { createTestClient } = require("apollo-server-testing");
const { typeDefs } = require("../typeDefs");
const { resolvers } = require("../resolvers");
const { PostDataSource } = require("./datasource");

const dataSources = {
    postDatasource: new PostDataSource(),
};


const GET_POSTS = gql`
    {
        posts {
            id
            votes
            title
        }
    }
`;

it("fetches posts", async () => {
    const server = new ApolloServer({
        typeDefs: [typeDefs],
        resolvers: [resolvers],
        dataSources: () => {
            return dataSources;
        },
    });

    const { query } = createTestClient(server);

    const res = await query({ query: GET_POSTS });
    expect(res).toMatchSnapshot();
});
