import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db.js';
const app = express();
const PORT = process.env.PORT || 9004;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());


const gqlServer = new ApolloServer({
    typeDefs:`
        type Query {
            hello: String
            say(name: String): String
        }

        type Mutation {
            createUser(firstName: String!, lastName:String!, email:String!, password:String!): Boolean
        }
    `,
    resolvers:{
        Query: {
            hello: () => 'Hello World',
            say: (_, {name}:{name:string}) => `Hey ${name} how are you`
        },
        Mutation:{
            createUser: async(_,{firstName, lastName, email, password}: {firstName:string; lastName:string; email:string; password:string}) => {
                await prismaClient.user.create({
                    data:{
                        firstName,
                        lastName,
                        email,
                        password,
                        salt:'random_salt'
                    }
                })
                return true
            }
        }
    }
});

const startServer = async() => {
    await gqlServer.start();
    app.use('/graphql', expressMiddleware(gqlServer));
    app.listen(PORT, () => console.log(`Server is started on PORT:${PORT}`));
}

startServer();

