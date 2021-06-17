import { body } from "express-validator"

export const userValidator = [
    body("name").exists().isString().isLength({ min: 2, max: 64 }).withMessage("Error is field name"),
    body("surname").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field surname"),
    body("email").exists().isEmail().isLength({ max: 128 }).withMessage("Error in field email"),
    body("bio").exists().isString().isLength({ min: 8, max: 1024 }).withMessage("Error in field bio"),
    body("title").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field title"),
    body("area").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field area"),
    body("username").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field username")
]

export const experienceValidator = [
    body("role").exists().isString().isLength({ min: 2, max: 128 }).withMessage("Error is field role"),
    body("company").exists().isString().isLength({ min: 2, max: 128 }).withMessage("Error in field company"),
    body("startDate").exists().isDate().withMessage("Error in field startDate"),
    body("description").exists().isString().isLength({ min: 8, max: 1024 }).withMessage("Error in field description"),
    body("area").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field area"),
    body("username").exists().isString().isLength({ min: 2, max: 32 }).withMessage("Error in field username")
]

export const postValidator = [
    body("text").exists().isString().isLength({ min: 16, max: 8192 }).withMessage("Error in field text"),
]

export const commentValidator = [
    body("comment").exists().isString().isLength({ min: 2, max: 4096 }).withMessage("Error in field comment"),
]
