import express from "express";
import { body, validationResult } from "express-validator";
import { verifyPasswordAndCreateJWT } from "../services/AuthentificationService";

const loginRouter = express.Router();

loginRouter.post("/",
    body("email").isEmail().normalizeEmail(),
    body("password").isString(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }
        try {
            const user = req.body.email;
            const pass = req.body.password;

            const jwtTokenString = await verifyPasswordAndCreateJWT(user, pass);
            res.cookie("access_token", jwtTokenString)
            res.sendStatus(200);

        } catch (err) {
            res.status(404);
            next(err);
        }
    })

export default loginRouter;