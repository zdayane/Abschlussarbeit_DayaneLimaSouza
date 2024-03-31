import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createNews, editNews, editNewsByEditor, getNews, getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsResource, NewsStatus, UserResource } from '../BoardResources';
import OffcanvasStatus from './OffcanvasStatus';
import { Cloud } from 'react-bootstrap-icons';


function NewsArchive() {
        // State variables to manage user, current news, and form inputs
    const { userID, setUserID } = useUserIDContext();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const params = useParams();
    const newsID = params.newsId;
    const navigate = useNavigate();
    const { boardID, setBoardID } = useBoardIDContext();

        // Function to load user, board, and news data
    async function load() {
        const user = getUserIDFromJWT();
        if (user) {
            setUserID(user);

            if (userID) {
                const myUser = await getUser(userID)
                setUser(myUser)
            }
        }

        if (boardID) {
            setBoardID(boardID);
        }
        if (boardID) {
            const myNews = await getNewsList(boardID);
        }

        if (newsID) {
            const newsData = await getNews(newsID);
            if (newsData) {
                setCurrentNews(newsData)
                setTitle(newsData.title);
                setText(newsData.text);
            }
        }
    }

    useEffect(() => {
        load();
    }, [userID, boardID]);

    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleContinueClick = () => {
        setShowOffcanvas(true);
    }

    const handleCloseOffcanvas = () => {
        setShowOffcanvas(false);
    }

    // Function to render interaction buttons based on news status
    const renderInteractionButtons = () => {
        if (currentNews && newsID) {
            if (currentNews.status === NewsStatus.EDITED) {
                return (
                    <>
                        <Button variant="primary" onClick={() => navigate(`/board/${boardID}`)}>Back</Button>
                        <Button variant="primary" onClick={handleContinueClick}>Continue</Button>
                        <Button variant="primary" onClick={async () => {
                            const resp = await editNewsByEditor(newsID, title, text, currentNews!.category, currentNews.journalistId, currentNews.status)
                            console.log(resp)
                            if (resp) {
                                //navigate(`/news/${newsID}/edit`);
                            }
                        }}>Save changes</Button>
                    </>
                );
            } else {
                return (
                    <>
                        <Button variant="primary" onClick={() => navigate(`/board/${boardID}`)}>Back</Button>
                        <Button variant="primary" onClick={handleContinueClick}>Continue</Button>
                    </>
                );
            }
        }
    }

    if (boardID) {

        return (
            <>
                <>
                    <Form className="max-width-1000" >
                        <Form.Group controlId="title" className="mb-3">
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title"

                            />
                        </Form.Group>
                        <Form.Group controlId="content" className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Text"
                            />
                        </Form.Group>

                        <div>
                            {renderInteractionButtons()}
                        </div>

                    </Form>
                </>
                <OffcanvasStatus open={showOffcanvas} handleClose={handleCloseOffcanvas} currentNews={currentNews} boardId={boardID} />
            </>
        );
    } else {
        return (
            <>
                <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Card.Body>
                    <h5>
                      <Cloud /> 
                    </h5>
                  </Card.Body>
                </Card>
              </>
        )
    }

}


export default NewsArchive;
