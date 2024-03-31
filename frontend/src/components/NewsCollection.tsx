import { Link, useNavigate } from 'react-router-dom';
import { NewsResource, NewsStatus } from '../BoardResources';
import { Button, Card } from 'react-bootstrap';


type MyCollectionProps = {
    collection: NewsResource
}



export default function Collection(
    { collection }: MyCollectionProps,
) {

    
    let newsUrl;

    switch (collection.status) {
        case (NewsStatus.DRAFT):
            newsUrl = `/news/${collection.id}`;
            break;
        case (NewsStatus.SUBMITTED):
            newsUrl = `/news/${collection.id}/submit`;
            break;
        case (NewsStatus.EDITED):
            newsUrl = `/news/${collection.id}/edit`;
            break;
        default:
            newsUrl = `/news/${collection.id}`;
    }
    

    return (
        <div className="my-3">

            <Card >
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="badge-secondary">Status: {collection.status}</span>
                </Card.Header>
                <Card.Body>
                    <Card.Title>{collection.title}</Card.Title>
                    <Card.Text>
                        <strong>Author:</strong> {collection.journalist} | <strong> Created at:</strong> {collection.createdAt}
                    </Card.Text>
                    <Card.Text>

                        <div className="mt-2">

                            {collection?.editor && (
                                <div className="mb-2"> <strong>Editor: </strong> {collection?.editor}</div>
                            )}
                        </div>
                    </Card.Text>
                    <Link to={newsUrl} className="btn btn-primary">
                        Go to News
                    </Link>
                </Card.Body>
            </Card>

        </div>
    );
}

