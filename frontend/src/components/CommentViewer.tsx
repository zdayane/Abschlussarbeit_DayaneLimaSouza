import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { CommentResource, NewsResource } from '../BoardResources';
import { getComment, getNews } from '../backend/boardapi';
import { Cloud } from 'react-bootstrap-icons';

interface CommentViewerProps {
  comment: CommentResource;
}

const CommentViewer = ({ comment }: CommentViewerProps) => {
  const [currentComment, setCurrentComment] = useState<CommentResource | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);

  useEffect(() => {
    async function loadComment() {
      try {
        if (comment) {

          if (comment.id) {
            const feedback = await getComment(comment.id);

            if (feedback) {
              setCurrentComment(feedback);
              const newsData = await getNews(feedback.newsId);
              if (newsData) {
                setCurrentNews(newsData)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }

    loadComment();
  }, []);

  // Render comment and related news data if available
  if (currentComment && currentNews) {
    return (
      <>
        <br />

        <Card className="mb-3">
          <Card.Body>
            <Card.Header>{currentComment.text}</Card.Header>
            <Card.Text className="text-muted">
              Created At: {currentComment.createdAt}
            </Card.Text>
          </Card.Body>
        </Card>
      </>
    );

  } else {
    // Render a message if no comment or news data is available
    return (
      <>
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card.Body>
            <h5>
              <Cloud /> Empty list
            </h5>
          </Card.Body>
        </Card>
      </>
    )
  }
};

export default CommentViewer;
