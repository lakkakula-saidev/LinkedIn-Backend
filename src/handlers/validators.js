import { body } from "express-validator"

export const userValidator = [
    body("name").exists().withMessage("Name is a mandatory field!"),
    body("surname").exists().isLength({ min: 5 }).withMessage("Description is mandatorty and needs to be more than 50 characters!"),
    body("email").exists().isLength({ max: 50 }).withMessage("Brand is a mandatory field!"),
    body("bio").exists().isInt().withMessage("Price is a mandatory field and needs to be an integer!"),
    body("title").exists().withMessage("Title is a mandatory field!"),
    body("Area").exists().withMessage("Area is a mandatory field!"),
    body("username").exists().withMessage("Username is a mandatory field!")
]

export const postValidator = [
    body("text").exists().withMessage("Category is a mandatory field").isString().withMessage("Category is of wrong type"),
    body("title").exists().withMessage("Title is a mandatory field").isString().withMessage("Title is of wrong type"),
    body("cover").isURL().withMessage("Cover needs to be of type URL if present"),
    body("content").exists().withMessage("Content is a mandatory field").isString().withMessage("Content is of wrong type"),

    // Object readTime
    body("readTime").exists().withMessage("Read Time is a mandatory object").isObject().withMessage("Read Time is of wrong type"),
    body("readTime.value").exists().withMessage("Read Time => Value is a mandatory field").isNumeric({ min: 0, max: 800 }).withMessage("Read Time => Value is of wrong type or out of bonds"),
    body("readTime.unit").exists().withMessage("Read Time => Unit is a mandatory field").isString().withMessage("Read Time => Unit is of wrong type"),
]

export const commentValidator = [
    body("text").exists().withMessage("Category is a mandatory field").isString().withMessage("Category is of wrong type"),
    body("title").exists().withMessage("Title is a mandatory field").isString().withMessage("Title is of wrong type"),
    body("cover").isURL().withMessage("Cover needs to be of type URL if present"),
    body("content").exists().withMessage("Content is a mandatory field").isString().withMessage("Content is of wrong type"),

    // Object readTime
    body("readTime").exists().withMessage("Read Time is a mandatory object").isObject().withMessage("Read Time is of wrong type"),
    body("readTime.value").exists().withMessage("Read Time => Value is a mandatory field").isNumeric({ min: 0, max: 800 }).withMessage("Read Time => Value is of wrong type or out of bonds"),
    body("readTime.unit").exists().withMessage("Read Time => Unit is a mandatory field").isString().withMessage("Read Time => Unit is of wrong type"),
]
