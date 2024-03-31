import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getNews, getUser, getUserIDFromJWT, sendToReviewByEditor, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsResource, UserResource } from '../BoardResources';
import { ArrowDownLeftSquare } from 'react-bootstrap-icons';

interface ButtonProps {
    currentNews: NewsResource | null;
    boardID: string | undefined;
}
function RequestChangesButton() {
    const { userID, setUserID } = useUserIDContext();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const params = useParams();
    const newsID = params.newsId;
    const navigate = useNavigate();
    const { boardID, setBoardID } = useBoardIDContext();

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

        if (newsID) {
            const newsData = await getNews(newsID);
            if (newsData) {
                setCurrentNews(newsData)
            }
        }

    }

    useEffect(() => {
        load();
    }, [userID, boardID]);

    const handleAction = async () => {
        setShowModal(true);
    }

    const handleConfirmation = async () => {

        try {
            if (newsID && currentNews) {
                const resp = await sendToReviewByEditor(newsID, currentNews.title, currentNews.text, currentNews.category, currentNews.journalistId, currentNews.status)

                if (resp) {
                    setShowModal(false);
                    navigate(`/news/${newsID}`);
                    window.location.reload()
                }
            }
        } catch (err) {
            console.log(err);
        }
    };


    return (
        <>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to request changes in this article?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmation}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            <>

                <Button variant="primary" style={{ width: '100%' }} onClick={handleAction}>
                    <h6>
                        <ArrowDownLeftSquare /> Request change
                    </h6>
                </Button>
            </>

        </>
    );
}

export default RequestChangesButton;
