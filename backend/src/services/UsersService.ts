import { Board } from "src/model/BoardModel"
import { User, UserRole } from "../model/UserModel"
import { Types } from "mongoose"
import { createBoard } from "./BoardService"

export type UsersResource = {
    users: UserResource[]
}

export type UserResource = {
    id?: string
    name: string
    email: string
    role: UserRole;
    password?: string
}


/**
 * all users
 * @returns A promise that resolves to a UsersResource 
 */
export async function getUsers(): Promise<UsersResource> {

    const users = await User.find().exec();
    const mappedArray = await Promise.all(
        users.map(async (element) => {
            return {
                id: element.id,
                name: element.name,
                email: element.email.toLowerCase(),
                role: element.role
            }
        })
    );

    return {
        users: mappedArray
    }
}

/**
 * user by ID
 * @param id The ID of the user to retrieve
 * @returns A promise that resolves to a UserResource 
 * @throws Error if the user with the specified ID is not found
 */
export async function getUser(id: string): Promise<UserResource> {
    const user = await User.findById(id).exec();
    if (user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            role: user.role
        }
    } else {
        throw new Error(`User with id " ${id} " not found`);
    }
}

/**
 * Creates a new user
 * @param userResource The user resource 
 * @returns A promise that resolves to the created UserResource 
 */
export async function createUser(userResource: UserResource): Promise<UserResource> {

    const user = await User.create({
        id: userResource.id,
        name: userResource.name,
        email: userResource.email.toLowerCase(),
        role: userResource.role,
        password: userResource.password
    });


    if (!user.id) { throw new Error(`No user with id ${user.id} found`); }

    const board = {
        owner: user.name,
        ownerId: user.id
    }

    if (user.id) { 
        const myBoard = await createBoard(board);
    }

    return {
        id: user.id.toString(),
        name: user.name,
        email: user.email.toLowerCase(),
        role: user.role
    }
}

/**
 * Updates an existing user
 * @param userResource The user resource 
 * @returns A promise that resolves to the updated UserResource 
 * @throws Error if the user with the specified ID is not found or if there's an issue updating the user
 */
export async function updateUser(userResource: UserResource): Promise<UserResource> {

    const userId = userResource.id;
    const user = await User.findById(userId).exec();
    if (!user) {
        throw new Error(`No user with id ${userId} found, cannot update`);
    }

    user.name = userResource.name;
    if (userResource.email) {
        user.email = userResource.email.toLowerCase();
    }

    user.role = userResource.role;
    if (userResource.role) {
        user.role = userResource.role;
    }

    // wenn update hat passwort 
    if (userResource.password) {
        if (! await user.isCorrectPassword(userResource.password)) {
            throw new Error(`Wrong password, cannot change password for user id ${userId} found`);
        }
        //set new password
        user.password = userResource.password;
    }
    const savedUser = await user.save();
    return {
        id: savedUser.id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
    }
}


/**
 * Deletes a user by ID
 * @param id The ID of the user to delete
 * @returns A promise that resolves once the user is successfully deleted
 * @throws Error if the user with the specified ID is not found
 */
export async function deleteUser(id: string): Promise<void> {

    const user = await User.findById(id).exec();
    if (!user) {
        throw new Error(`No user with id ${id} found, cannot delete`);
    }
    await User.deleteOne({ _id: new Types.ObjectId(user._id) }).exec();
}
