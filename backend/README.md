# Backend

## Reasons for using Neo4J to solve exercise 5
We could choose between two scenarios regarding exercise 5. The first scenario was to use a remote GraphQL Api and a headless CMS in order to avoid to host a local database. The second scenario was to setup a database for Neo4J locally, either on the own host machine or with a docker.
We decided to implement the second scenario and to use a docker for educational reasons since we were eager to learn more about Neo4J and docker architectures. Especially, we were interested in the topics concerning schema stitching and schema delegation with Neo4J.

## Project setup

```
npm install
```

Create a `.env` file in this directory.

```
JWT_SECRET=<Your Secret>
NEO4J_USERNAME=<Neo4J Username>
NEO4J_PASSWORD=<Neo4J Password>
```

### Run the server

run Neo4J with Docker

```
$ docker run  --publish=7474:7474 --publish=7687:7687 --env 'NEO4JLABS_PLUGINS=["apoc"]' --env=NEO4J_AUTH=none neo4j:latest
```

run the backend

```
npm run serve
```

### Lints files

```
npm run lint
```
