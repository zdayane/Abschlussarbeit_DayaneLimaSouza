import { Link, useNavigate } from 'react-router-dom';
import { NewsResource, NewsStatus } from '../BoardResources';
import { Button, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { getNews } from '../backend/boardapi';


type NewsViewerProps = {
    news: NewsResource;
}

export default function NewsViwer(
    { news }: NewsViewerProps
) {
    const [currentNews, setCurrentNews] = useState<NewsResource | null>(null);

    async function load() {
        if (news && news.id) {
            const newsData = await getNews(news.id);
            if (newsData) {
                setCurrentNews(newsData)
            }
        }
    }

    useEffect(() => {
        load();
    }, []);


    return (
        <>
            <Card.Body className="text-center">

                <blockquote className="blockquote mb-4">
                    <p>
                            <div className="mb-2">
                                <span className="badge bg-primary">
                                    {news?.status}
                                </span>
                            </div>
                        
                        {news?.title}
                        {' '}
                    </p>
                </blockquote>

                <Card.Text>
                    <footer className="blockquote-footer">

                        {news.journalist && (
                            <>
                                By < cite title="Source Title">{news.journalist}</cite> |
                            </>

                        )}
                        Created at: {news.createdAt}
                    </footer>

                    <div className="mb-2">

                        <Button variant="primary" disabled>
                            {news?.category}

                        </Button>

                    </div>

                    <hr />

                    {news?.text}

                </Card.Text>

            </Card.Body>
        </>
    );
}

