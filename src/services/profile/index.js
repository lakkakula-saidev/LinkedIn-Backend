import express from 'express'
import { userValidator } from '../../handlers/validators.js';
import userSchema from '../../schema/user.js'
import mongoose from "mongoose"
const { isValidObjectId } = mongoose

const profileRouter = express.Router();

// GET ALL
profileRouter.get("/", async (req, res, next) => {
    try {
        const response = await userSchema.find()
        res.send(response)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

// GET WITH ID
profileRouter.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const response = await userSchema.findById(id)
        res.send(response)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

// POST NEW
profileRouter.post("/", userValidator, async (req, res, next) => {
    try {
        const newUser = new userSchema(req.body)
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

// EDIT WITH ID
profileRouter.put("/:id", async (req, res, next) => {
    try {
        const response = await userSchema.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
        if (response) {
            res.send(response)
        } else {
            next(createError(404, `Profile with _id:${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

// DELETE WITH ID
profileRouter.delete("/:id", async (req, res, next) => {
    try {
        let response
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID: ${req.params.id} is invalid`))
        else response = await userSchema.findByIdAndDelete(req.params.id)

        if (response) res.status(204).send()
        else next(createError(404, `Profile with id: ${req.params.id} not found`))
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// add multer stuff here later

// POST IMAGE TO ID
profileRouter.post("/:id/picture", async (req, res, next) => {
    try {
        const newUser = new userSchema(req.body)
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
})

/*profileRouter.route("/:id/experiences")
    .get("", (req, res, next) => { })
    .get("", (req, res, next) => { })
    .post("", (req, res, next) => { })
    .put("", (req, res, next) => { })
    .delete("", (req, res, next) => { })*/

export default profileRouter
