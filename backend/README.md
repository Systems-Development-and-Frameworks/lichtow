# Backend

## Project setup

```
npm install
```

Create a `.env` file in this directory.

```
JWT_SECRET=<Your Secret>
process.env.NEO4J_USER=<Neo4J User>
process.env.NEO4J_PASSWORD=<Neo4J Password>
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
