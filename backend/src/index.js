import Server from "./server";


const server = new Server();

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
