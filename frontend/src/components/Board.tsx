import { BoardResource } from "../BoardResources";
import { useEffect, useState } from "react";
import { getBoard, useBoardIDContext, useUserIDContext } from "../backend/boardapi";
import Loading from "./Loading";
import NewsList from "./NewsList";

function Board() {
    const [board, setBoard] = useState<BoardResource | null>(null);
    const { userID } = useUserIDContext();
    const { boardID } = useBoardIDContext();

    async function load() {
        try {
            if (boardID) {
                const myBoard = await getBoard(boardID);
                if (myBoard) {
                    setBoard(myBoard)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        load();
    }, [userID, boardID]);

    if (!board) {
        return <Loading />
    } else {
        return (
            < div >
                <NewsList />
            </div >
        );
    }

};

export default Board;
