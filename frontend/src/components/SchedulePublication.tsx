import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getNews, getUser, getUserIDFromJWT, publishNews, scheduleNews, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsResource, UserResource } from '../BoardResources';
import { CalendarCheck } from 'react-bootstrap-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function SchedulePublication() {
    const { userID, setUserID } = useUserIDContext();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const params = useParams();
    const newsID = params.newsId;
    const navigate = useNavigate();
    const [date, setDate] = useState<Date | null>(new Date());


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

        if (newsID && currentNews) {
            try {
                if (newsID && currentNews && date) {

                    const publishNow = new Date(Date.now());
                    const resp = await scheduleNews(newsID, currentNews.title, currentNews.text, currentNews.category, currentNews.journalistId, currentNews.status, date?.toDateString())

                    if (resp) {

                        if (date.getTime() <= publishNow.getTime()) {
                            const respPublish = await publishNews(newsID, resp.status)

                            if (respPublish) {
                                navigate(`/news/${newsID}`);
                                window.location.reload()
                                setShowModal(false);

                            }
                        }

                        setShowModal(false);
                        navigate(`/news/${newsID}`);
                        window.location.reload()
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
    };

    return (
        <>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a date for publication:</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                        />

                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmation}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            <>
                <Button variant="primary" style={{ width: '100%' }} onClick={handleAction}>
                    <h6>
                        <CalendarCheck /> Schedule the publication
                    </h6>
                </Button>
            </>

        </>
    );
}

export default SchedulePublication;
