import { getPainel } from "../services/PainelService";
import express from "express";

const painelRouter = express.Router();

painelRouter.get("/",
    async (req, res, next) => {

        try {
            let myPainel;
            const id = req.userId;
            // Checking if the user ID exists
            if (id) {
                myPainel = await getPainel(id);
            }
            res.send(myPainel); // 200 by default

        } catch (err) {

            res.status(404);
            next(err);

        }

    })


export default painelRouter;
