import express from "express"
import { postValidator } from "../../handlers/validators.js"
import postModel from "../../schema/post.js"
import mongoose from "mongoose"
const { isValidObjectId } = mongoose
import q2m from "query-to-mongo"
import createError from "http-errors"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const cloudinaryStorage = new CloudinaryStorage({ cloudinary, params: { folder: "bw3" } })
const upload = multer({ storage: cloudinaryStorage }).single("image")

const routes = express.Router()

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
            .populate("user")
            .populate("comments.user")

        res.status(200).send({ links: query.links("/posts", total), total, result })
    } catch (error) {
        next(createError(500, error))
    }
})

// GET POST WITH ID
routes.get("/:id", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else result = await postModel.findById(req.params.id).populate("user").populate("comments.user")
        res.send(result)
    } catch (error) {
        next(createError(500, error))
    }
})

// POST NEW POST
routes.post("/", postValidator, async (req, res, next) => {
    try {
        const entry = new postModel(req.body)
        const result = await entry.save()
        res.status(201).send(result._id)
    } catch (error) {
        next(createError(500, error))
    }
})

// EDIT POST WITH ID
routes.put("/:id", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else result = await postModel.findByIdAndUpdate(req.params.id, { ...req.body }, { runValidators: true, new: true, useFindAndModify: false })

        if (result) res.send(result)
        else next(createError(404, `ID: ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
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
        next(createError(500, error))
    }
})

// POST IMAGE TO POST WITH ID
routes.post("/:id", upload, async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else
            result = await postModel.findByIdAndUpdate(
                req.params.id,
                { $set: { image: req.file.path } },
                { timestamps: false, new: true, useFindAndModify: false }
            )

        if (result) res.status(200).send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// ADD LIKE TO POST WITH ID
routes.post("/:id/like", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!req.body.id) next(createError(404, `ID is missing`))
        else if (!isValidObjectId(req.body.id)) next(createError(400, `ID ${req.body.id} is invalid`))
        else post = await postModel.findById(req.params.id)

        if (post) {
            const result = await postModel.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { likes: req.body.id } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) res.send(true)
            else next(createError(404, `Failed to add like to ${req.params.id}`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// DELETE LIKE FROM POST WITH ID
routes.delete("/:id/like", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else post = await postModel.findById(req.params.id)

        if (post) {
            const result = await postModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { likes: req.body.id } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) res.send(true)
            else next(createError(404, `Failed to remove like from ${req.params.id}`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// GET ALL COMMENTS FROM POST WITH ID
routes.get("/:id/comment/", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else post = await postModel.findById(req.params.id, { comments: 1, _id: 0 })

        if (post) res.send(post.comments)
        else next(createError(404, `ID ${req.params.id} not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// GET COMMENT WITH CID FROM POST WITH ID
routes.get("/:id/comment/:cid", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.cid)) next(createError(400, `ID ${req.params.cid} is invalid`))
        else post = await postModel.findOne({ _id: req.params.id }, { comments: { $elemMatch: { _id: req.params.cid } } })

        if (post) {
            if (post.comments && post.comments.length > 0) res.send(post.comments[0])
            else next(createError(404, `Comment ${req.params.cid} not found`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// POST NEW COMMENT TO POST WITH ID
routes.post("/:id/comment/", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else post = await postModel.findById(req.params.id)

        if (post) {
            const result = await postModel.findByIdAndUpdate(
                req.params.id,
                { $push: { comments: { ...req.body, createdAt: new Date(), updatedAt: new Date() } } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) {
                res.send(result.comments[result.comments.length - 1])
            } else next(createError(404, `Failed to add comment to ${req.params.id}`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

//EDIT COMMENT WITH CID FROM POST WITH ID
routes.put("/:id/comment/:cid", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.cid)) next(createError(400, `ID ${req.params.cid} is invalid`))
        else
            post = await postModel.findOneAndUpdate(
                { _id: req.params.id, "comments._id": req.params.cid },
                { $set: { "comments.$": { ...req.body, _id: req.params.cid, updatedAt: new Date() } } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

        if (post) res.send(post)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// DELETE COMMENT WITH CID FROM POST WITH ID
routes.delete("/:id/comment/:cid", async (req, res, next) => {
    try {
        let post
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.cid)) next(createError(400, `ID ${req.params.cid} is invalid`))
        else
            post = await postModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { comments: { _id: req.params.cid } } },
                { new: true, useFindAndModify: false, timestamps: false }
            )

        if (post) res.send(post)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

export default routes
