import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { createUser, getBoardIDFromJWT, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../BoardResources';

function CreateUserPage() {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        role: "Journalist",
        password: ""
    });
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

    const navigate = useNavigate();

    async function handleSubmit() {
        console.log(userData)

        const newUser = await createUser(userData.name, userData.email, userData.password, userData.role);
        if (newUser) {
            const userID = getUserIDFromJWT();
            const boardID = getBoardIDFromJWT();
            navigate('/');
        } else {
            console.error('Error creating user:');
        }

    }

    function handleChange(e: { target: { name: any; value: any; }; }) {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Create User</Card.Title>
                            <Card.Text>

                                <Form.Group controlId="Role" className="mt-4">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select
                                        value={userData.role}
                                        onChange={handleChange}
                                        name="role"
                                    >
                                        <option value="Journalist">{UserRole.JOURNALIST}</option>
                                        <option value="Editor">{UserRole.EDITOR}</option>
                                        <option value="Radio">{UserRole.RADIO}</option>
                                    </Form.Select>
                                </Form.Group>


                                <Form.Group controlId="Name" className="mt-4">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        name="name"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="Email" className="mt-4">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        name="email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="Password" className="mt-4">
                                    <Form.Label>Password </Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        name="password"
                                        required
                                    />
                                </Form.Group>
                            </Card.Text>


                            <br />
                            <Button
                                variant="primary"
                                type="submit"
                                className="mb-4"
                                style={{ width: '100%' }}
                                onClick={handleSubmit}
                            >
                                Create User
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CreateUserPage;
