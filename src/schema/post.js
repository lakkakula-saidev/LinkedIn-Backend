import mongoose from "mongoose"

const { Schema, model } = mongoose

const commentSchema = new Schema({
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const likeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const postSchema = new Schema(
    {
        text: { type: String, required: true },
        username: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        image: { type: String, default: null },
        comments: { type: [commentSchema], default: [] },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
    },
    { timestamps: true }
)

export default model("Post", postSchema)
