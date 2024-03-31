import { Schema, Model, model, Types, Query } from "mongoose"
import bcrypt from 'bcryptjs';

// Enum representing the possible roles of a user
export enum UserRole {
    EDITOR = 'Editor',
    JOURNALIST = 'Journalist',
    RADIO = 'Radio'
}

export interface IUser {
    email: string;
    name: string;
    password: string;
    role: UserRole;
}

type UserModel = Model<IUser, {}, IUserMethods>;

// Define the Mongoose schema for the user 
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, unique: true, required: true },
    name: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true }
});

// hash the password before saving to the database
userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    next();
})

// hash the password before updating a document
userSchema.pre<Query<any, IUser>>("updateOne",
    async function () {
        const update = this.getUpdate() as { password?: string } | null;
        if (update?.password != null) {
            const hashedPassword = await bcrypt.hash(update.password, 10);
            this.setUpdate({
                $set: {
                    password: hashedPassword, confirmpw: undefined
                }
            });
        }
    })

// hash the password before findOneAndUpdate operation
userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as { password?: string } | null;
    if (update?.password) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        this.setUpdate({
            $set: {
                password: hashedPassword, confirmpw: undefined
            }
        });
    }
    next()
});

interface IUserMethods {
    isCorrectPassword(candidatePassword: string): Promise<boolean>;
    hasRole(role: UserRole.EDITOR | UserRole.JOURNALIST | UserRole.RADIO): boolean;
}

// Method to check if the user has a specific role
userSchema.method("hasRole", function (role: UserRole.EDITOR | UserRole.JOURNALIST | UserRole.RADIO) {
    return this.role === role;
});

//check if the provided password matches the user's hashed password
userSchema.method("isCorrectPassword",
    async function (candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password).then((result: boolean) => {
            return result;
        }).catch((err: any) => { throw (err) });
    });

// Create a Mongoose model for the "User" entity using the defined schema
export const User = model('User', userSchema);
