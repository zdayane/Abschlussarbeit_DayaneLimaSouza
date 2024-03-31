import { Schema, model, Types } from "mongoose"

// Define an interface to represent the structure of a board
export interface IBoard{
    ownerId: Types.ObjectId;
}

const boardSchema = new Schema<IBoard>({
    ownerId: {type: Schema.Types.ObjectId, ref: "User", required: true}, 
});

// Create a Mongoose model for the "Board" entity using the defined schema
export const Board = model("Board", boardSchema);