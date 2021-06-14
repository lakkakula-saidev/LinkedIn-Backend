import express from 'express'
import { userValidator } from '../../handlers/validators.js';
import userSchema from '../../schema/user.js'

const profileRouter = express.Router();


profileRouter.get("/", async (req, res, next) => {
    try {
        const response = await userSchema.find()
        res.send(response)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

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


profileRouter.get("/", async (req, res, next) => {
    try {
        const response = await userSchema.findByIdAndDelete(req.params.id)
        if (response) {
            res.status(204).send()
        } else {
            next(createError(404, `Profile with id: ${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

export default profileRouter