import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createComment, getFeedback, getNews, getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { FeedbacksResource, NewsResource, UserResource, UserRole } from '../BoardResources';
import CommentViewer from './CommentViewer';


function Comment() {
  const { userID, setUserID } = useUserIDContext();
  const [comment, setComment] = useState('');
  const [user, setUser] = useState<UserResource | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
  const [myFeedback, setMyFeedbacks] = useState<FeedbacksResource | null>(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const params = useParams();
  const newsID = params.newsId;
  const { boardID, setBoardID } = useBoardIDContext();

  // Function to load user, board, news, and comments data
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
        setCurrentNews(newsData);
        const myComments = await getFeedback(newsID);
        if (myComments) {
          setMyFeedbacks(myComments)
        }
      }
    }


  }

  useEffect(() => {
    load();
  }, [userID, boardID]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true); // Show modal on submit

  }

  // Function to confirm comment submission
  const handleConfirmSubmit = async () => {
    try {
      if (userID && newsID) {

        const resp = await createComment(userID, newsID, comment);
        console.log(resp)
        if (resp) {
          navigate(`/news/${newsID}/reject`);
          window.location.reload(); // Reload page to display new comment

        }

      }
    } catch (err) {
      console.log(err);
    }
  };

  // Function to render comments
  const feedbacks = () => {
    if (myFeedback) {
      return (
        myFeedback.board.map(item => (

          <div key={item.id} className="news-card">
            <CommentViewer key={item.id} comment={item} />
          </div>

        ))
      )
    } else {
      <p></p>
    }

  }

  return (
    <>
      <br />
      <div className="container">
        <Card>
          <Card.Body>
            <Card.Title>Feedback to the article</Card.Title>
            {user?.role === UserRole.EDITOR && ( // Check if user is editor
              <Form className="max-width-1000">
                <Card>
                  <Card.Body>
                    <Form.Group controlId="content" className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                      />
                    </Form.Group>
                    <Button variant="primary" style={{ width: '25%' }} onClick={handleSubmit}>
                      Add
                    </Button>
                  </Card.Body>
                </Card>
              </Form>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Submission</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure you want to submit this comment?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmSubmit}>
                  Confirm
                </Button>
              </Modal.Footer>
            </Modal>
            {feedbacks()}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Comment;