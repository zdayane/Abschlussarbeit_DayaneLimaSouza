import { useEffect, useState } from "react";
import { archiveNews, createNews, deleteNews, editNews, editNewsByEditor, editNewsDraft, getNews, getNewsList, getUser, getUserIDFromJWT, publishNews, rejectNews, sendToReviewByEditor, submitNews, useBoardIDContext, useUserIDContext } from "../backend/boardapi";
import { NewsResource, NewsStatus, UserResource, UserRole } from "../BoardResources";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Modal } from "react-bootstrap";
import { ArrowDownLeftSquare, CalendarCheck, ChatLeftDots, Check2Square, CheckAll, EyeFill, EyeSlash, Pen, Send, Trash3, XOctagon } from "react-bootstrap-icons";
import ConfirmationModal from "./ConfirmationModal";
import DeleteButton from "./DeleteButton";
import SubmitButton from "./SubmitButton";
import EditJornalistButton from "./EditJornalistButton";
import RejectButton from "./RejectButton";
import EditButton from "./EditButton";
import EndingEditButton from "./EndingEditButton";
import SchedulePublication from "./SchedulePublication";
import ArchiveButton from "./ArchiveButton";
import RequestChangesButton from "./RequestChangesButton";
import RepublishButton from "./RepublishButton";
import SendFeedbackButton from "./SendFeedbackButton";

/**
 * Status
 */
interface StatusProps {
    currentNews: NewsResource | null;
    boardID: string | undefined;
}

export enum buttonStatus {
    DRAFT = "Draft",
    SUBMIT = "Submit",
    IN_REVIEW = "In Review",
    REJECT = "Reject",
    DELETE = "Delete",
    SCHEDULE = "Scheduled",
    PUBLIS = "Publish",
    EDIT = "Edit",
    ARCHIVE = "Archive",
}


function Status({ currentNews, boardID }: StatusProps) {
    const { userID, setUserID } = useUserIDContext();
    const [user, setUser] = useState<UserResource | null>(null);

    const params = useParams();
    const newsID = params.newsId;
    const navigate = useNavigate();

    async function load() {

        const user = getUserIDFromJWT();
        if (user) {
            setUserID(user);

            if (userID) {
                const myUser = await getUser(userID)
                setUser(myUser)
            }
        }

    }

    useEffect(() => {
        load();
    }, [userID, boardID]);

  
    const renderStatusButtons = () => {

        if (currentNews && newsID) {

            if (user?.role === UserRole.EDITOR) {

                if (currentNews.status === NewsStatus.IN_REVIEW) {

                    return (
                        <>
                            <RejectButton />
                            <br />
                            <hr />
                            <DeleteButton />
                            <br />
                            <hr />
                            <SchedulePublication />
                            <br />
                            <hr />
                            <EditButton />
                        </>
                    );
                } else if (currentNews.status === NewsStatus.EDITED) {
                    return (
                        <>
                            <EndingEditButton />
                        </>
                    )
                }

                else if (currentNews.status === NewsStatus.REJECTED) {
                    return (
                        <>
                            <>
                                <DeleteButton />
                            </>

                        </>
                    )
                }

                else if (currentNews.status === NewsStatus.ARCHIVED) {
                    return (
                        <>
                            <RepublishButton />
                            <br />
                            <hr />
                            <DeleteButton />
                        </>
                    )

                }

                else if (currentNews.status === NewsStatus.PUBLISHED) {
                    return (
                        <>
                            <ArchiveButton />
                            <br />
                            <hr />
                            <RequestChangesButton />
                        </>
                    )

                }

            } else if (user?.role === UserRole.JOURNALIST) {

                if (currentNews.status === NewsStatus.DRAFT) {

                    return (
                        <>
                            <DeleteButton />
                            <br />
                            <hr />
                            <EditJornalistButton></EditJornalistButton>
                            <br />
                            <hr />
                            <SubmitButton></SubmitButton>

                        </>
                    );
                } else if (currentNews.status === NewsStatus.REJECTED) {

                    return (
                        <>
                            <EditJornalistButton></EditJornalistButton>
                        </>
                    );
                }
            }

        } else {

            if (user?.role === UserRole.JOURNALIST) {


            }
        }
    }


    return (
        <>
            <br />

            <Card>
                <Card.Body>
                    <>
                        {renderStatusButtons()}
                    </>

                </Card.Body>

            </Card>


        </>
    )
}
export default Status;