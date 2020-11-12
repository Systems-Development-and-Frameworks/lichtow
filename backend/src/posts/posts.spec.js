const { ApolloServer, gql } = require("apollo-server");
const { createTestClient } = require("apollo-server-testing");
const { typeDefs } = require("./typeDefs");
const { resolvers } = require("./resolvers");

const GET_BOOKS = gql`
    {
        books {
            author
            title
        }
    }
`;

it("fetches books", async () => {
    const server = new ApolloServer({
        typeDefs: [typeDefs],
        resolvers: [resolvers],
    });

    const { query } = createTestClient(server);

    const res = await query({ query: GET_BOOKS });
    expect(res).toMatchSnapshot();
});
