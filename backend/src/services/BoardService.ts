import { BoardResource } from "./Resources";
import { User } from "../model/UserModel";
import { Board } from "../model/BoardModel";
import { Types } from "mongoose";

/**
 * Function to create a board
 * @param boardResource The board resource containing ownerId
 * @returns A promise with the created board resource
 */
export async function createBoard(boardResource: BoardResource): Promise<BoardResource> {
    const owner = await User.findById(boardResource.ownerId).exec();
    if (!owner) {throw new Error(`No Owner with id ${boardResource.ownerId} found`);}

    const board = await Board.create({
        id: boardResource.id,
        ownerId: boardResource.ownerId
    });

    return {
        id: board.id,
        ownerId: board.ownerId.toString()
    }
}

/**
 * Function to update a board
 * @param boardResource The board resource containing id and ownerId
 * @returns A promise with the updated board resource
 */
export async function updateBoard(boardResource: BoardResource): Promise<BoardResource> {
    const board = await Board.findById(boardResource.id).exec();
    if (!board) {
        throw new Error(`No board found, cannot update`);
    }

    // check the owner
    const owner = await User.findById(boardResource.ownerId).exec();
    if (!owner) {throw new Error(`No Owner with id ${board.ownerId} found`);}

    // save the updates
    const savedboard = await board.save();

    return {
        id: savedboard.id,
        ownerId: savedboard.ownerId.toString(),
    }
}

/**
 * Function to delete a board
 * @param id The ID of the board to delete
 * @returns A promise that resolves when the board is deleted
 */
export async function deleteBoard(id: string): Promise<void> {
    const boardNew = await Board.findById(id).exec();
    if (!boardNew) {
        throw new Error(`No user found, cannot update`);
    }
    await Board.deleteOne({ _id: new Types.ObjectId(id) }).exec();
}

export async function getBoard(userId: string): Promise<BoardResource> {
    if(!userId){
        throw new Error(`No userId found`);
    }

    const myID = {ownerId: userId}
    const board = await Board.findOne(myID).exec();

    if (!board) {
        throw new Error(`Board Not found`);
    }
    return {
        id: board.id,
        ownerId: board.ownerId.toString(),
    }}
