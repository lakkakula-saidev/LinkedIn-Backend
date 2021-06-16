import express from 'express'
import q2m from "query-to-mongo"
import mongoose from "mongoose"
const { isValidObjectId } = mongoose
import createError from "http-errors"
import { pipeline, Readable } from 'stream'
import { Parser } from "json2csv"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { userValidator } from '../../handlers/validators.js';
import userModel from '../../schema/user.js'
import generatePDFStream from "../../handlers/pdfout.js"


const cloudinaryStorage = new CloudinaryStorage({ cloudinary, params: { folder: "bw3" } })
const upload = multer({ storage: cloudinaryStorage }).single("image")

const profileRouter = express.Router();

// GET ALL
profileRouter.get("/", async (req, res, next) => {
    try {
        const query = q2m(req.query)
        let keys = Object.keys(query.criteria)
        let values = Object.values(query.criteria)
        const customQuery = { $or: [{ "surname": { "$regex": `${query.criteria.name}`, "$options": "i" } }, { "name": { "$regex": `${query.criteria.name}`, "$options": "i" } }] }
        const total = await userModel.countDocuments(query.criteria)
        const limit = 25
        const result = await userModel
            .find((keys.length === 1 && keys[0] === 'name') && (values.length === 1 && values[0].length >= 3) ? customQuery : query.criteria)
            /*  .collation({ locale: 'en', strength: 2 }) */
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit && query.options.limit < limit ? query.options.limit : limit)

        res.status(200).send({ links: query.links("/profile", total), total, result })
    } catch (error) {
        next(error)
    }
})

// GET WITH ID
profileRouter.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const response = await userModel.findById(req.params.id)
        res.send(response)
    } catch (error) {
        console.log(error)
        next(createError(500, error))
    }
})

// POST NEW
profileRouter.post("/", userValidator, async (req, res, next) => {
    try {
        const newUser = new userModel(req.body)
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        console.log(error)
        next(createError(400, error))
    }
})

// EDIT WITH ID
profileRouter.put("/:id", async (req, res, next) => {
    try {
        const response = await userModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true, useFindAndModify: false })
        if (response) {
            res.send(response)
        } else {
            next(createError(404, `Profile with _id:${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, error))
    }
})

// DELETE WITH ID
profileRouter.delete("/:id", async (req, res, next) => {
    try {
        let response
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else response = await userModel.findByIdAndDelete(req.params.id, { useFindAndModify: false })

        if (response) res.status(204).send()
        else next(createError(404, `Profile with id: ${req.params.id} not found`))
    } catch (error) {
        console.log(error)
        next(createError(500, error))
    }
})

// POST IMAGE TO ID
profileRouter.post("/:id/picture", upload, async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else result = await userModel.findByIdAndUpdate(req.params.id, { $set: { image: req.file.path } }, { new: true, useFindAndModify: false })

        if (result) res.status(200).send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// DOWNLOAD EXPERIENCES AS CSV FROM PROFILE WITH ID
profileRouter.get("/:id/experiences/CSV", async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else {
            const user = await userModel.findById(req.params.id)
            const fields = ["_id", "role", "company", "startData", "endDate", "description", "area"]
            const parser = new Parser({ fields })
            const csv = parser.parse(user.experiences)
            const stream = Readable.from(csv)
            res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
            pipeline(stream, res, error => (error ? createError(500, error) : null))
        }
    } catch (error) {
        next(createError(500, error))
    }
})

// Get all experiences
profileRouter.get("/:id/experiences", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else result = await userModel.findById(req.params.id)

        if (result) res.status(200).send(result.experiences)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})


profileRouter.get("/:id/experiences/:expId", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.expId)) next(createError(400, `Expericene ID: ${req.params.expId} is invalid`))
        else result = await userModel.findOne({ _id: req.params.id }, { experiences: { $elemMatch: { _id: req.params.expId } } })

        res.send(result)
    } catch (error) {
        console.log(error)
        next(createError(500, error))
    }
})

profileRouter.post("/:id/experiences", async (req, res, next) => {
    try {
        let temp
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else temp = await userModel.findById(req.params.id)

        if (temp) {
            const result = await userModel.findByIdAndUpdate(
                req.params.id,
                { $push: { experiences: { ...req.body, createdAt: new Date(), updatedAt: new Date() } } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) {
                res.send(result.experiences[result.experiences.length - 1])
            } else next(createError(404, `Failed to add comment to ${req.params.id}`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})


profileRouter.put("/:id/experiences/:expId", async (req, res, next) => {
    try {
        let exp
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.expId)) next(createError(400, `ID ${req.params.expId} is invalid`))
        else
            exp = await userModel.findOneAndUpdate(
                { _id: req.params.id, "experiences._id": req.params.expId },
                { $set: { "experiences.$": { ...req.body, _id: req.params.expId, updatedAt: new Date() } } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

        if (exp) res.send(exp)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

profileRouter.delete("/:id/experiences/:expId", async (req, res, next) => {
    try {
        let exp
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.expId)) next(createError(400, `ID ${req.params.expId} is invalid`))
        else
            exp = await userModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { experiences: { _id: req.params.expId } } },
                { new: true, useFindAndModify: false, timestamps: false }
            )

        if (exp) res.send(exp)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

profileRouter.post("/:id/experiences/:expId/picture", upload, async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.expId)) next(createError(400, `ID ${req.params.expId} is invalid`))
        else result = await userModel.findOneAndUpdate(
            { _id: req.params.id, "experiences._id": req.params.expId },
            { $set: { "experiences.$": { image: req.file.path } } },
            { timestamps: false, runValidators: false, new: true, useFindAndModify: false }
        )
        if (result) res.status(200).send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(createError(500, error))
    }
})

// DOWNLOAD AS PDF FROM ID
profileRouter.get("/:id/CV", async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else {
            const data = await userModel.findById(req.params.id)
            res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
            pipeline(await generatePDFStream(data), res, error => (error ? createError(500, error) : null))
        }
    } catch (error) {
        next(createError(500, error))
    }
})

export default profileRouter
