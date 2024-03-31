import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Alert, Toast, ToastContainer, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createNews, designateEditor, editNews, editNewsDraft, getFeedback, getNews, getNewsList, getUser, getUserIDFromJWT, submitNews, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { FeedbacksResource, NewsResource, NewsStatus, UserResource, UserRole } from '../BoardResources';
import Comment from "./Comment";
import OffcanvasStatus from './OffcanvasStatus';
import SendFeedbackButton from './SendFeedbackButton';
import { ArrowRight } from 'react-bootstrap-icons';

function NewsReject() {
    const { userID, setUserID } = useUserIDContext();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showConfirmationToast, setShowConfirmationToast] = useState(false);
    const [myFeedback, setMyFeedbacks] = useState<FeedbacksResource | null>(null);
    const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
    const [category, setCategory] = useState('');



    const params = useParams<{ newsId: string }>();
    const newsID = params.newsId;
    const navigate = useNavigate();

    const { boardID, setBoardID } = useBoardIDContext();

    async function load() {
        const user = getUserIDFromJWT();
        if (user) {
            setUserID(user);

            if (userID) {
                const myUser = await getUser(userID);
                setUser(myUser);
            }
        }

        if (boardID) {
            setBoardID(boardID);
            const myNews = await getNewsList(boardID);
        }

        if (newsID) {
            const newsData = await getNews(newsID);
            if (newsData) {
                setCurrentNews(newsData);
                setTitle(newsData.title);
                setCategory(newsData.category);
                setText(newsData.text);


                const myComments = await getFeedback(newsID);
                if (myComments) {
                    setMyFeedbacks(myComments);

                    // Show continue button if there are more than one comment
                    if (myFeedback) {
                        setShowContinueButton(myFeedback.board.length > 1);
                    }
                }
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

    const sendFeedbackButtons = () => {

    }

    const renderInteractionButtons = () => {

        if (user?.role === UserRole.EDITOR) {
            return (
                <>
                    <Button variant="primary" style={{ width: '25%' }} onClick={async () => navigate(`/board/${boardID}`)}>Back</Button>
                    {sendFeedbacks()}
                </>
            )
        } else {
            return (
                <>
                    <Button variant="primary" style={{ width: '25%' }} onClick={async () => navigate(`/board/${boardID}`)}>Back</Button>
                    <Button variant="primary" onClick={handleContinueClick}>
                        <h6>
                            <ArrowRight></ArrowRight>
                        </h6>
                    </Button>
                </>

            )
        }


    };


    const renderButtons = () => {
        if (currentNews && newsID) {
            if (userID && user?.role === UserRole.EDITOR && currentNews.status === NewsStatus.SUBMITTED) {
                return (
                    <>
                        <Button variant="primary" onClick={() => setShowConfirmationModal(true)}>Assign editor</Button>
                        <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm Editor Assignment</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Are you sure you want to be assigned as editor of this article?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={assignEditor}>Confirm</Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                );
            } else if (user?.role === UserRole.JOURNALIST && currentNews.status === NewsStatus.SUBMITTED) {
                return (
                    <Button variant="primary" onClick={() => navigate(`/board/${boardID}`)}>Back</Button>
                );
            }
        }
    };

    const assignEditor = async () => {
        if (newsID) {
            const resp = await designateEditor(newsID, title, text, currentNews!.category, currentNews!.journalistId, NewsStatus.REJECTED, userID!, user!.name);
            if (resp) {
                setShowConfirmationModal(false);
                setShowConfirmationToast(true);
            }
        }
    };

    const sendFeedbacks = () => {
        if (myFeedback && myFeedback.board.length > 0) {
            return (
                <SendFeedbackButton />
            )
        } else {
            <p></p>
        }

    }

    if (boardID) {

        return (
            <>
                <div className="container">

                    <Row>
                        <Col sm={4}>
                            <>
                                <Comment></Comment>
                            </>
                            <OffcanvasStatus open={showOffcanvas} handleClose={handleCloseOffcanvas} currentNews={currentNews} boardId={boardID} />
                        </Col>

                        <Col>
                            <Card>

                                <Card.Body>
                                    <Form className="max-width-1000" >
                                        <Form.Group controlId="title" className="mb-3">
                                            <Form.Control
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Title"
                                                disabled
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="category" className="mb-3">
                                            <Form.Control
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="Category"
                                                disabled
                                            />
                                        </Form.Group>


                                        <Form.Group controlId="tex" className="mb-3">
                                            <Form.Control
                                                as="textarea"
                                                rows={20}
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                placeholder="Text"
                                                disabled
                                            />
                                        </Form.Group>
                                    </Form>


                                </Card.Body>

                                <Card.Footer className="d-flex justify-content-between">
                                    {renderInteractionButtons()}
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row >
                </div>

            </>

        );

    } else {
        return (
            <>
                <p>Board not found</p>
            </>
        )
    }
}

export default NewsReject;
