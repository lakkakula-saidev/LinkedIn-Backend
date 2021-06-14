import mongoose from "mongoose"

const { Schema, model } = mongoose

const experienceSchema = new Schema(
    {
        role: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        description: { type: String, required: true },
        area: { type: String, required: true },
        username: { type: String, required: true },
        createdAt: { type: Date, default: new Date() },
        updatedAt: { type: Date, default: new Date() },
        image: { type: String, default: "https://via.placeholder.com/420?text=User%Experience" }
    }
)

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true },
        bio: { type: String, required: true },
        area: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, default: "https://via.placeholder.com/420?text=User%20User" },
        username: { type: String, required: true },
        posts: [{ type: Schema.Types.ObjectId, ref: "Post", required: true }],
        experiences: { type: [experienceSchema], default: [], required: true }
    },
    { timestamps: true }
)

export default model("User", userSchema)
