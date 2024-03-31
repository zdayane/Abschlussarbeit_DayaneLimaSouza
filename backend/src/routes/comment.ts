import express from "express";
import { body, matchedData, param, validationResult } from 'express-validator';
import { requiresAuthentication } from "./authentification";
import { IComment, Comment } from "../model/CommentModel";
import { User, UserRole } from "../model/UserModel";
import { createComment, deleteComment, updateComment } from "../services/CommentService";

const minLength = 100;
const commentRouter = express.Router();

commentRouter.get("/:commentId",
    [param('commentId').isMongoId()],
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        try {

            const commentData = matchedData(req) as IComment & { commentId: string };
            const comment = await Comment.findById(commentData.commentId).exec();

            res.send(comment);

        } catch (err) {
            res.status(404);
            next(err);
        }
    }
)


commentRouter.post("/",
    body('id').optional().isMongoId(),
    body('editorId').isMongoId(),
    body('newsId').isMongoId(),
    body('text').isString().isLength({ max: minLength }),
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        // Autorisierung
        const user = await User.findById(req.userId);
        if (!user) {
            res.sendStatus(404);
            return;
        }

        if (user.role != UserRole.EDITOR) {
            res.status(403).send("You are not the editor this news.");
            return;
        }

        try {
            const commentData = req.body;
            const comment = await createComment(commentData);
            console.log(comment)
            res.send(comment); // 200 by default

        } catch (err) {
            res.status(404);
            next(err);
        }
    }
)

commentRouter.put("/:commentId/",
    body('id').optional().isMongoId(),
    body('editorId').isMongoId(),
    body('newsId').isMongoId(),
    body('text').isString().isLength({ max: minLength }),
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

                // Autorisierung

        const editor = await User.findById(req.userId);
        if (!editor) {
            res.sendStatus(404);
            return;
        }

        if (editor.role != UserRole.EDITOR) {
            res.status(403).send("You are not the editor this news.");
            return;
        }

        try {

            const commentData = req.body;
            const comment = await updateComment(commentData);
            res.status(201);
            res.send(comment); // 200 by default

        } catch (err) {
            res.status(404);
            next(err);
        }
    }
);

commentRouter.delete("/:commentId/",
    [
        param('commentId')
            .isMongoId(),
    ],
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        // Autorisierung
        const user = await User.findById(req.userId);
        if (!user) {
            res.sendStatus(404);
            return;
        }

        if (user.role != UserRole.EDITOR) {
            res.status(403).send("You are not the editor this news.");
            return;
        }

        try {

            const commentData = matchedData(req) as IComment & { commentId: string };
            const commentDeleted = await deleteComment(commentData.commentId);
            res.status(204);
            res.send(commentDeleted); // 200 by default

        } catch (err) {
            res.status(404);
            next(err);
        }
    })

export default commentRouter;
