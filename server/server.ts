import { config } from "dotenv"

config()

import fastify from "fastify"

const app = fastify()

console.log("heee")
app.listen({ port: parseInt(process.env.PORT!)})
