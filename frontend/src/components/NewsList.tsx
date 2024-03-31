import { PainelResource, UserResource, UserRole } from "../BoardResources";
import { useEffect, useState } from "react";
import { getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from "../backend/boardapi";
import { Link, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import Collection from "./NewsCollection";
import TabNewsByStatus from "./TabNewsByStatus";
import { Button, Card } from "react-bootstrap";
import { FileEarmarkPlus } from "react-bootstrap-icons";


// Component to display the list of news articles
function NewsList() {
    const [news, setNews] = useState<PainelResource | null>(null);
    const { userID } = useUserIDContext();
    const { boardID, setBoardID } = useBoardIDContext();
    const [user, setUser] = useState<UserResource | null>(null);

    // Function to load news data
    async function load() {
        try {
            const user = getUserIDFromJWT();
            if (user) {
                setUser(user);

                if (userID) {
                    const myUser = await getUser(userID)
                    setUser(myUser)
                }
            }

            if (boardID) {
                setBoardID(boardID);
                const myNews = await getNewsList(boardID);
                setNews(myNews);
            }
        } catch (err) {
            setNews(null);
        }
    }

    useEffect(() => {
        load();
    }, [userID, boardID]);

    if (!news) {
        return <Loading />
    } else {

        return (
            <>
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                            <Button variant="secondary">{user?.role}</Button>
                            <span> Hi, {user?.name}! </span>
                        </div>
                        {user?.role === UserRole.JOURNALIST && (
                            <Link to="/news">
                                <Button variant="primary">
                                <FileEarmarkPlus /> New Article 
                                </Button>
                            </Link>
                        )}
                    </Card.Header>
                </Card>
                <TabNewsByStatus />
            </>
        );
    }

};

export default NewsList;
