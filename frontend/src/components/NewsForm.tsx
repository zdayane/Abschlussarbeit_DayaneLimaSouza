import { useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createNews, getNews, getUser, getUserIDFromJWT,  useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsResource, UserResource} from '../BoardResources';
import { Floppy } from 'react-bootstrap-icons';
import BackButton from './BackButton';


function NewsForm() {
  const { userID, setUserID } = useUserIDContext();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [showConfirmationToast, setShowConfirmationToast] = useState(false);
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

    if (newsID) {
      const newsData = await getNews(newsID);
      if (newsData) {
        setCurrentNews(newsData)
        setTitle(newsData.title);
        setText(newsData.text);
        setCategory(newsData.category);
      }
    }
  }

  useEffect(() => {
    load();
  }, [userID, boardID]);

  const handleSubmit = async () => {
    setShowModal(true);
  }

  const handleSaveConfirmation = async () => {

    try {
      if (userID) {
        const resp = await createNews(title, text, category, userID);

        if (resp.id) {
          setCurrentNews(resp)
          setShowModal(false);
          setShowConfirmationToast(true);

          if (showConfirmationToast) {
            navigate(`/news/${resp.id}`);
          }

        }

      }

    } catch (err) {
      console.log(err);
    }
  };

  // Render interaction buttons for the form
  const renderInteractionButtons = () => {
    return (
      <>
        <BackButton/>

        <Button variant="primary" style={{ width: '25%' }} onClick={handleSubmit}>
          <h6>
            Save <Floppy></Floppy>
          </h6>
        </Button>
      </>

    )

  }

  return (
    <>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to save this article?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveConfirmation}>Save Article</Button>
        </Modal.Footer>
      </Modal>

      <Card>
        <Card.Header>
          <Card.Title>Create a new article</Card.Title>
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

      <>
        <ToastContainer
          className="p-3"
          position={'middle-center'}
          style={{ zIndex: 1 }}
        >
          <Toast
            show={showConfirmationToast}
            onClose={() => {
              setShowConfirmationToast(false);
              if(currentNews?.id){
                navigate(`/news/${currentNews?.id}`);
              }
            }}
          >
            <Toast.Header>
              <strong className="me-auto">
                The article has been successfully saved!
              </strong>

            </Toast.Header>
          </Toast>
        </ToastContainer>
      </>
    </>
  );
}

export default NewsForm;
