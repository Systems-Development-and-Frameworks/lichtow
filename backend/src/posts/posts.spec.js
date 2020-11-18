import  { ApolloServer, gql } from "apollo-server";
import  { createTestClient } from "apollo-server-testing";
import  typeDefs  from "../typeDefs";
import  resolvers  from "../resolvers";
import  { PostDataSource } from "./datasource";

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
