import { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {  getNews, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import {useParams } from 'react-router-dom';
import { NewsResource, NewsStatus, UserResource, UserRole } from '../BoardResources';
import OffcanvasStatus from './OffcanvasStatus';
import { ArrowRight, Cloud } from 'react-bootstrap-icons';
import NewsViwer from './NewsViewer';
import BackButton from './BackButton';


function News() {
        // State variables to manage user, journalist, current news, and offcanvas status
    const { userID, setUserID } = useUserIDContext();
    const [journalist, setJournalist] = useState('');
    const [user, setUser] = useState<UserResource | null>(null);
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
    const params = useParams();
    const newsID = params.newsId;
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

        if (newsID) {
            const newsData = await getNews(newsID);
            if (newsData) {
                setCurrentNews(newsData);

                if (currentNews) {
                    const jornalist = await getUser(currentNews!.journalistId);
                    console.log(currentNews)
                    setJournalist(jornalist.name)
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

    const renderInteractionButtons = () => {
        return (
            <>
                <BackButton/>

                {user?.role === UserRole.EDITOR                     
                && currentNews?.status !== NewsStatus.SCHEDULED
                &&
                    <Button variant="primary" style={{ width: '25%' }} onClick={handleContinueClick}>
                        <h6>
                            <ArrowRight></ArrowRight>
                        </h6>
                    </Button>
                }

                {user?.role === UserRole.JOURNALIST && (
                    currentNews?.status !== NewsStatus.IN_REVIEW 
                    && currentNews?.status !== NewsStatus.SUBMITTED
                    && currentNews?.status !== NewsStatus.SCHEDULED
                ) &&
                    <Button variant="primary"style={{ width: '25%' }}  onClick={handleContinueClick}>
                        <h6>
                            <ArrowRight></ArrowRight>
                        </h6>
                    </Button>
                }
            </>
        );
    };

    if (boardID && currentNews) {
        return (
            <>
                <Card>
                    <NewsViwer news={currentNews}></NewsViwer>
                    <Card.Footer className="d-flex justify-content-between">
                        {renderInteractionButtons()}
                    </Card.Footer>
                </Card>
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

export default News;
