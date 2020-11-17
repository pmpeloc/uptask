const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
require('dotenv').config('variables.env');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const conectarDB = require('./config/db');

// conectar a la BD
conectarDB();

const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                return {
                    usuario
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
});

server.listen().then(({url}) => {
    console.log(`Servidor listo en la URL ${url}`);
});