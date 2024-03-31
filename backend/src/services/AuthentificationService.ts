import { JwtPayload, sign, decode } from "jsonwebtoken";
import { User } from "../model/UserModel";
import dotenv from "dotenv";
import { Board } from "../model/BoardModel";


dotenv.config() // read ".env"

const secret = process.env.JWT_SECRET;
const ttl = process.env.JWT_TTL
    ? parseInt(process.env.JWT_TTL)
    : 300;


/**
* Function to log in a user
*/
export async function login(email: string, password: string): Promise<{ success: boolean, id?: string, name?: string }> {
    if (!email) {
        throw new Error(`Email not provided`);
    }

    // Finding the user by email
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
        throw new Error(`User not found`);
    }

    // Checking if the provided password is correct
    if (await user.isCorrectPassword(password)) {
        return {
            success: true,
            id: user._id.toString(),
            name: user.email
        }
    } else {
        return {
            success: false
        }
    }
}


// Function to verify user credentials and create a JWT
export async function verifyPasswordAndCreateJWT(email: string, password: string): Promise<string | undefined> {
    const myLoggin = await login(email, password);

    // Checking if login was successful
    if (myLoggin.success) {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
            throw new Error(`User not found`);
        }

        const board = await Board.findOne({ ownerId: user.id }).exec();
        if (!board) {
            throw new Error(`Board not found`);
        }

        let payload: JwtPayload = { sub: user.id, "boardID": board.id };
        if (secret && ttl && payload) {
            const jwtString = sign(payload, secret, { expiresIn: ttl }); // Creating JWT 
            return jwtString;
        }

    } else {
        throw new Error(`Error - Loggin`);
    }

}

// Function to verify a JWT
export function verifyJWT(jwtString: string | undefined): string {
    if (!secret) {
        throw new Error(`JWT secret missing`);
    }

    if (jwtString) {
        const result = decode(jwtString);
        if (result?.sub) {
            return result.sub.toString();
        }
    }

    throw new Error(`Invalid token`);

}
