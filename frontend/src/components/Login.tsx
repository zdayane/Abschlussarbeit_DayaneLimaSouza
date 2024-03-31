import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import {getBoardIDFromJWT, getUserIDFromJWT, login, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'react-bootstrap-icons';

function Login() {
    const { userID, setUserID } = useUserIDContext();
    const { boardID, setBoardID } = useBoardIDContext();

    async function load() {
        if (userID) {
            setUserID(userID);
        }
        if (boardID) {
            setBoardID(boardID);
        }
    }
    useEffect(() => {
        load();
    }, [userID, boardID]);


    const [data, setData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
    }

    async function handleLogin(email: string, password: string) {
        setIsLoading(true);
        await login(email, password);
        const userID = getUserIDFromJWT();
        const boardID = getBoardIDFromJWT();

        if (userID) {
            setUserID(userID);
            window.location.href = `/board/${boardID}`;
        }
        setIsLoading(false);
    }

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    return (
        <>
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title className="text-center mb-4">Login</Card.Title>

                                <Card.Text>

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group controlId="Email" className="mt-4">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="Email"
                                                value={data.email}
                                                onChange={update}
                                                name="email"
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="Password" className="mt-4">
                                            <Form.Label>Password </Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={data.password}
                                                onChange={update}
                                                name="password"
                                            />
                                        </Form.Group>
                                    </Form>

                                </Card.Text>

                                <>
                                    <>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            onClick={() => handleLogin(data.email, data.password)}
                                            className="mb-4"
                                            style={{ width: '100%' }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Loading...' : 'Login'}
                                        </Button>
                                    </>

                                    <div className="d-flex justify-content-center align-items-center mt-3">
                                        <hr className="flex-grow-1" />
                                        <span className="mx-3">or</span>
                                        <hr className="flex-grow-1" />
                                    </div>

                                    <div className="d-grid gap-2">
                                        <Button variant="secondary" style={{ width: '100%' }}
                                            onClick={() => navigate('/user')}>
                                            Create Account <ArrowRight />
                                        </Button>
                                    </div>

                                </>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Login;
