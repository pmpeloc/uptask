const { ApolloServer } = require('apollo-server');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const conectarDB = require('./config/db');

// conectar a la BD
conectarDB();

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({url}) => {
    console.log(`Servidor listo en la URL ${url}`);
});