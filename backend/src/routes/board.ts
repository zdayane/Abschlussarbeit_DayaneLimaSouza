import { createBoard, deleteBoard, updateBoard } from "../services/BoardService";
import express from "express";
import { requiresAuthentication } from "./authentification";
import { body, matchedData, param, validationResult } from "express-validator";
import { Board, IBoard } from "../model/BoardModel";
import { getPainel } from "../services/PainelService";
import { getUser } from "../services/UsersService";

const boardRouter = express.Router();
const maxLength = 1000;

// get board information 
boardRouter.get("/:boardId",
    [
        param('boardId')
            .isMongoId()
    ], requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }


        try {

            // check owner
            const boardId = req.params?.boardId;
            const board = await Board.findById(boardId).exec();

            if (!board) {
                res.sendStatus(404);
                return;
            }
            const user = await getUser(board.ownerId.toString())
            const id = user.id;

            if(id){
                const newsList = await getPainel(id);
                res.send(newsList); // 200 by default
            }

        } catch (err) {

            res.status(404);
            next(err);

        }
    })

// create a new board
boardRouter.post("/",
    body('id').optional().isMongoId(),
    body('description').isString().isLength({ max: maxLength }),
    body('ownerId').isMongoId(),
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        try {

            const userData = req.body;
            const user = await createBoard(userData);

            res.status(201);
            res.send(user); // 200 by default

        } catch (err) {

            res.status(404);
            next(err);

        }
    })

// update an existing board
boardRouter.put("/:boardId",
    [
        param('boardId')
            .isMongoId()
    ],
    body('description').isString().isLength({ max: maxLength }),
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        // check owner
        const boardId = req.params?.boardId;
        const board = await Board.findById(boardId);
        if (!board) {
            res.sendStatus(404);
            return;
        }

        // Autorisierung
        if (board.ownerId.toString() !== req.userId) {
            res.status(403).send("Not your board");
            return;
        }

        try {

            const user = await updateBoard(req.body);
            res.send(user); // 200 by default

        } catch (err) {

            res.status(404);
            next(err);

        }
    })

//delete an existing board
boardRouter.delete("/:boardId",
    [param('boardId').isMongoId()],
    requiresAuthentication,

    async (req: express.Request, res: express.Response, next: any) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ errors: errors.array() });
        }

        // check owner
        const boardId = req.params?.boardId;
        const board = await Board.findById(boardId);
        if (!board) {
            res.sendStatus(404);
            return;
        }
        // Autorisierung
        if (board.ownerId.toString() !== req.userId) {
            res.status(403).send("Not your board");
            return;
        }

        try {

            const boardData = matchedData(req) as IBoard & { boardId: string };
            const userDeleted = await deleteBoard(boardData.boardId);

            res.status(204);
            res.send(userDeleted); // 200 by default

        } catch (err) {

            res.status(404);
            next(err);

        }
    })



export default boardRouter;
