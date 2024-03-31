import { Schema, model, Types } from "mongoose"

export interface IComment{
    editorId: Types.ObjectId;
    newsId: Types.ObjectId;
    text: string;
    createdAt: Date;
}

// Define a Mongoose schema for the comment 
const commentSchema = new Schema<IComment>({
    editorId: {type: Schema.Types.ObjectId, ref: "User", required: true}, 
    newsId: {type: Schema.Types.ObjectId, ref: "News", required: true}, 
    text: {type: String, required: true},
    createdAt: {type: Date, timestamps: true, default: Date.now()}, 
});

export const Comment = model("Comment", commentSchema);
