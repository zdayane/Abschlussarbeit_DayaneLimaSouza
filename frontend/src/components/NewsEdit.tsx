import { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getNews, getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useParams } from 'react-router-dom';
import { NewsResource, UserResource } from '../BoardResources';
import OffcanvasStatus from './OffcanvasStatus';
import { ArrowRight, Cloud } from 'react-bootstrap-icons';
import SaveChangesButton from './SaveChangesButton';
import BackButton from './BackButton';


function NewsEdit() {
    const { userID, setUserID } = useUserIDContext();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [category, setCategory] = useState('');
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const params = useParams();
    const newsID = params.newsId;
    const { boardID, setBoardID } = useBoardIDContext();

    // Function to load user data and news
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
                setCategory(newsData.category);
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

    const renderInteractionButtons = () => {
        if (currentNews && newsID) {

            return (
                <>
                    <BackButton />
                    <SaveChangesButton></SaveChangesButton>
                    <Button variant="secondary" style={{ width: '25%' }} onClick={handleContinueClick}>
                        <h6>
                            <ArrowRight />
                        </h6>
                    </Button>
                </>
            )
        }
    }

    if (boardID) {
        return (
            <>
                <>
                    <Card>
                        <Card.Header>
                            <Card.Title>Edit the article</Card.Title>
                        </Card.Header>
                        <Card.Body>
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
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="Category"
                                    />
                                </Form.Group>

                                <Form.Group controlId="content" className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={20}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Text"
                                    />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between">
                            {renderInteractionButtons()}
                        </Card.Footer>
                    </Card>
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

export default NewsEdit;
