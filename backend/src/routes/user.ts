import express from "express";
import { IUser, User, UserRole } from "../model/UserModel";
import { Request } from "express";
import { body, matchedData, param, validationResult } from 'express-validator';
import { requiresAuthentication } from "./authentification";
import { createUser, deleteUser, updateUser } from "../services/UsersService";

const minLength = 1;
const userRouter = express.Router();


userRouter.get("/:userId",
    [param('userId').isMongoId()],
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }


        try {

            const userData = matchedData(req) as IUser & { userId: string };
            const user = await User.findById(userData.userId).exec();

            res.send(user);
        } catch (err) {
            res.status(404);
            next(err);
        }
    }
)

// creating a new user
userRouter.post("/",
    body('id').optional().isMongoId(),
    body('name').isString().isLength({ min: minLength }),
    body('password').isLength({ min: minLength }),
    body('email').isEmail().isLength({ min: minLength }),
    body('role').isString(),

    async (req: express.Request, res: express.Response, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        try {
            const userData = req.body;
            const user = await createUser(userData);
            res.send(user); // 200 by default
        } catch (err) {
            res.status(404);
            next(err);
        }
    }
)

// updating a user by ID
userRouter.put("/:userId/",
    param("userId").isMongoId(),
    body('email').isEmail().normalizeEmail().isLength({ max: minLength }),
    body('role').isString(),
    body('radio').isBoolean(),
    body('name').isString().isLength({ max: minLength }),
    body('password').optional().isStrongPassword().isLength({ max: minLength }),
    requiresAuthentication,

    async (req: Request<{}, {}, IUser>, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            res.sendStatus(404);
            return;
        }
        // Autorisierung
        if (user.role != UserRole.EDITOR) {
            res.status(403).send("You are not an admin.");
            return;
        }

        try {

            const userData = req.body;
            const user = await updateUser(userData);
            res.status(201);
            res.send(user); // 200 by default

        } catch (err) {
            res.status(404);
            next(err);
        }
    }
);

userRouter.delete("/:userId/",
    [
        param('userId')
            .isMongoId(),
    ],
    requiresAuthentication,
    async (req: express.Request, res: express.Response, next: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            res.sendStatus(404);
            return;
        }
        // Autorisierung
        if (user.role != UserRole.EDITOR) {
            res.status(403).send("You are not an admin.");
            return;
        }

        try {
            const userData = matchedData(req) as IUser & { userId: string };
            const userDeleted = await deleteUser(userData.userId);
            res.status(204);
            res.send(userDeleted); // 200 by default
        } catch (err) {
            res.status(404);
            next(err);
        }
    })

export default userRouter;
