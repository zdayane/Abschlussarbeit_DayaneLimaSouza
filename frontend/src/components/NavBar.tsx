import { Navbar, Container, Nav, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from "js-cookie";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { BoxArrowRight, JournalCode } from "react-bootstrap-icons";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('access_token') ? true : false);
  const navigate = useNavigate();
  
  const logout = () => {
    Cookies.remove('access_token');
    setIsLoggedIn(false);
    navigate('/');
  };


  return (
    <>
      <Navbar bg="light" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand href="/"> <JournalCode/> Home</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {isLoggedIn && <Button style={{ width: '100%' }} variant="outline-primary" onClick={logout}> Logout <BoxArrowRight/> </Button>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br />
    </>
  );
};

export default NavBar;
