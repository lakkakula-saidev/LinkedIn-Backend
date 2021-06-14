import express from 'express'
import { postValidator } from '../../handlers/validators.js';
import postModel from '../../schema/post.js'
import mongoose from "mongoose"
const { isValidObjectId } = mongoose

const routes = express.Router();

// GET ALL POSTS
routes.get("/", async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const total = await postModel.countDocuments(query.criteria)
        const limit = 25
        const result = await postModel
            .find(query.criteria)
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit && query.options.limit < limit ? query.options.limit : limit)

        res.status(200).send({ links: query.links("/users", total), total, result })
    } catch (error) {
        next(error)
    }
})

// GET POST WITH ID
routes.get("/:id", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else result = await postModel.findById(req.params.id)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

// POST NEW POST
routes.post("/", postValidator, async (req, res, next) => {
    try {
        const entry = new postModel(req.body)
        const result = await entry.save()
        res.status(201).send(result._id)
    } catch (error) {
        next(error)
    }
})

// EDIT POST WITH ID
routes.put("/:id", async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else result = await postModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true, useFindAndModify: false })

        if (result) res.send(result)
        else next(createError(404, `ID: ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

// DELETE POST WITH ID
routes.delete("/:id", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else result = await postModel.findByIdAndDelete(req.params.id, { useFindAndModify: false })

        if (result) res.status(204).send("Deleted")
        else next(createError(404, `ID: ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

// add multer stuff here later

// POST IMAGE TO POST WITH ID
routes.post("/:id", async (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})

// ADD LIKE TO POST WITH ID
routes.post("/:id/like", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})

// DELETE LIKE FROM POST WITH ID
routes.delete(":id/like", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})

// GET ALL COMMENTS FROM POST WITH ID
routes.get("/:id/comment/", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})
// GET COMMENT WITH CID FROM POST WITH ID
routes.get("/:id/comment/:cid", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})
// POST NEW COMMENT TO POST WITH ID
routes.post("/:id/comment/", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})
//EDIT COMMENT WITH CID FROM POST WITH ID
routes.put("/:id/comment/:cid", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})
// DELETE COMMENT WITH CID FROM POST WITH ID
routes.delete("/:id/comment/:cid", (req, res, next) => {
    try {
    } catch (error) {
        next(error)
    }
})

export default routes
