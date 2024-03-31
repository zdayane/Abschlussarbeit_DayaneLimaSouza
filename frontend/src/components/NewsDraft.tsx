import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { editNewsDraft, getFeedback, getNews, getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { FeedbacksResource, NewsResource, UserResource } from '../BoardResources';
import Comment from "./Comment"
import OffcanvasStatus from './OffcanvasStatus';
import { ArrowRight, Floppy } from 'react-bootstrap-icons';
import BackButton from './BackButton';

// Component to handle news drafts
function NewsDraft() {
  const { userID, setUserID } = useUserIDContext();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [user, setUser] = useState<UserResource | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);
  const params = useParams();
  const newsID = params.newsId;
  const navigate = useNavigate();
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
      console.log(newsData)
      if (newsData) {
        setCurrentNews(newsData)
        setTitle(newsData.title);
        setText(newsData.text);
        setCategory(newsData.category);
      }

      const myComments = await getFeedback(newsID);
      if (myComments) {
        setMyFeedbacks(myComments);
      }
    }
  }

  useEffect(() => {
    load();
  }, [userID, boardID]);




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  }

  // Handle saving changes confirmation
  const handleSaveConfirmation = async () => {

    try {
      if (newsID && currentNews) {

        const resp = await editNewsDraft(newsID, title, text, category, currentNews.journalistId, currentNews.status)
        console.log("resp: " + resp)

        if (resp) {
          navigate(`/news/${newsID}/draft`);
          window.location.reload();

        }
      }
    } catch (err) {
      console.log(err);
    }
  };


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

          <Button variant="primary" style={{ width: '25%' }} onClick={handleSubmit}>
            <h6>
              Save <Floppy></Floppy>
            </h6>
          </Button>

          <Button variant="primary" style={{ width: '25%' }} onClick={handleContinueClick}>

            <h6>
              <ArrowRight></ArrowRight>
            </h6>

          </Button>

        </>

      )
    }
  }

  const [myFeedback, setMyFeedbacks] = useState<FeedbacksResource | null>(null);

  const renderInteractionComments = () => {

    if (myFeedback && myFeedback.board.length > 0) {

      return (
        <div className="container">

          <Row>
            <Col sm={4}>
              <>
                <Comment></Comment>
              </>
            </Col>


            <Col>
              <Card>
                <Card.Header>
                  <Card.Title>Edit your article</Card.Title>
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
            </Col>
          </Row >
        </div>

      )

    } else {

      return (

        <Card>
          <Card.Header>
            <Card.Title>Edit your article</Card.Title>
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

      )
    }
  }

  if (boardID) {

    return (
      <>
        <>
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to save the changes to this article?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveConfirmation}>Save changes</Button>
            </Modal.Footer>
          </Modal>

          <div className="container">
            {renderInteractionComments()}
          </div>

        </>
        <OffcanvasStatus open={showOffcanvas} handleClose={handleCloseOffcanvas} currentNews={currentNews} boardId={boardID} />

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


export default NewsDraft;
