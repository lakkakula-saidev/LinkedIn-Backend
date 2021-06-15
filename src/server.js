import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import services from "./services/index.js"
import listEndpoints from "express-list-endpoints"
import createError from "http-errors"
import logModel from "./schema/log.js"

const server = express()
const port = process.env.PORT || 1234

const whitelist = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_PROD_URL]
const corsOptions = {
    origin: (origin, next) => {
        try {
            if (whitelist.indexOf(origin) !== -1) {
                next(null, true)
            } else {
                next(createError(400, "Cross-Site Origin Policy blocked your request"), true)
            }
        } catch (error) {
            next(error)
        }
    }
}

const logger = async (req, res, next) => {
    try {
        const entry = new logModel({
            method: req.method,
            query: req.query,
            params: req.params,
            body: req.body
        })

        await entry.save()
        next()
    } catch (error) {
        next(error)
    }
}
/* server.use(logger) */

/* server.use(cors(corsOptions)) */
server.use(express.json())


server.use("/api", services)

const error = (err, _req, res, _next) => {
    res.status(err.status).send(err.message)
}

server.use(error)

mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    server.listen(port, () => {
        console.table(listEndpoints(server))
        console.log("server is running on port:", port)
    })
})
