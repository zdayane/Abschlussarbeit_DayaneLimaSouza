import { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { designateEditor, getUser, getUserIDFromJWT, getNews, getNewsList, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsResource, NewsStatus, UserResource, UserRole } from '../BoardResources';
import NewsViwer from './NewsViewer';
import Loading from './Loading';
import ConfirmationModal from './ConfirmationModal';
import BackButton from './BackButton';


function NewsSubmitted() {
  const { userID, setUserID } = useUserIDContext();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [user, setUser] = useState<UserResource | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const params = useParams<{ newsId: string }>();
  const newsID = params.newsId;
  const navigate = useNavigate();
  const { boardID, setBoardID } = useBoardIDContext();
    
  // Function to load news data
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
        setText(newsData.text);
      }
    }
  }

  useEffect(() => {
    load();
  }, [userID, boardID]);

  const renderInteractionButtons = () => {
    if (currentNews && newsID) {
      if (userID && user?.role === UserRole.EDITOR && currentNews.status === NewsStatus.SUBMITTED) {
        return (
          <>
            <BackButton />
            <Button variant="primary" style={{ width: '25%' }} onClick={() => setShowConfirmationModal(true)}>Assign editor</Button>
            <ConfirmationModal
              show={showConfirmationModal}
              handleClose={() => setShowConfirmationModal(false)}
              handleConfirm={assignEditor}
            />
          </>
        );
      } else if (user?.role === UserRole.JOURNALIST && currentNews.status === NewsStatus.SUBMITTED) {
        return (
          <BackButton />
        );
      }
    }
  };

  // Function to assign editor to the news article
  const assignEditor = async () => {
    if (newsID && currentNews) {
      const resp = await designateEditor(newsID, currentNews.title, currentNews.text, currentNews.category, currentNews!.journalistId, NewsStatus.REJECTED, userID!, user!.name);
      if (resp) {
        setShowConfirmationModal(false);
        navigate(`/news/${newsID}`);
        window.location.reload();
      }
    }
  };

  if (currentNews) {
    return (
      <>
        <Card>
          <NewsViwer news={currentNews}></NewsViwer>
          <Card.Footer className="d-flex justify-content-between">
            {renderInteractionButtons()}
          </Card.Footer>
        </Card>
      </>
    );
  } else {
    return <Loading />;
  }
}

export default NewsSubmitted;
