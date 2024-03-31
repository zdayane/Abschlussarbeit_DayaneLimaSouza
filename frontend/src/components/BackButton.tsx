import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom";
import { getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import { UserResource } from '../BoardResources';

const BackButton = () => {
    const navigate = useNavigate();
    const { userID, setUserID } = useUserIDContext();
    const [user, setUser] = useState<UserResource | null>(null);
    const { boardID, setBoardID } = useBoardIDContext();

    // Function to load user and board data

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
    }

    // Load data on initial render and whenever user ID or board ID changes
    useEffect(() => {
        load();
    }, [userID, boardID]);

    // Function to navigate back to the board page
    const goBack = () => {
        navigate(`/board/${boardID}`);
        window.location.reload();
    };

    return (
        <>
            <Button variant="secondary" style={{ width: '25%' }} type="button" onClick={goBack}>{
                <ArrowLeft />
            } </Button>
        </>
    );
}

export default BackButton;
