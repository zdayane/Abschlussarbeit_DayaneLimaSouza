import { param, validationResult } from "express-validator";
import express from "express";
import { requiresAuthentication } from "./authentification";
import { News } from "../model/NewsModel";
import { getFeedback } from "../services/FeedbackService";

const feedbackRouter = express.Router();

feedbackRouter.get("/:newsId",
    param("newsId").isMongoId(),
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        const newsId = req.params.newsId;
        const news = await News.findById(newsId);

        if (!news) {
            res.sendStatus(404);
            return;
        }

        try {

            let myFeedbacks;
            if (news.id) {
                myFeedbacks = await getFeedback(news.id);
            }
            res.send(myFeedbacks); // 200 by default

        } catch (err) {

            res.status(404);
            next(err);

        }

    })


export default feedbackRouter;
