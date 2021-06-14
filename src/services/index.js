import express from "express"
const routes = express.Router()

import profileRouter from "./profile/index.js"
//import postsRouter from "./post/index.js"

routes.use("/profile", profileRouter)
//route.use("/posts", postsRouter)

export default routes
