import mongoose from "mongoose"

const { Schema, model } = mongoose

const logSchema = new Schema(
    {
        params: { type: Object, required: true },
        query: { type: Object, required: true },
        body: { type: Object, required: true },
        method: { type: String, required: true }
    },
    { timestamps: true }
)

export default model("Log", logSchema)
