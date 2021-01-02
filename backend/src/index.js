import Server from "./server";
require("dotenv").config();

const playground = {
    settings: {
        "schema.polling.enable": false,
    },
};

const server = new Server({ playground });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
