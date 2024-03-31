/* istanbul ignore file */
import Cookies from 'js-cookie'
import jwtDecode from "jwt-decode";
import React from "react";
import { BoardResource, CommentResource, FeedbacksResource, NewsResource, PainelResource, UserResource } from '../BoardResources';

const HOST = process.env.REACT_APP_API_SERVER_URL;

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
}

/**
 * News
 */

export async function createNews(title: string, text: string, category: string, journalistId: string): Promise<NewsResource> {
    const url = `${HOST}/news`;
    const req = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
        })
    });

    return req.json();
}

export async function editNewsDraft(newsId: string, title: string, text: string, category: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/draft`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}

export async function editNews(newsId: string, title: string, text: string, category: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/draft`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}


export async function editNewsByEditor(newsId: string, title: string, category: string, text: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/edit`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}

export async function sendToReviewByEditor(newsId: string, title: string, category: string, text: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/review`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}

// designateEditor

export async function designateEditor(newsId: string, title: string, text: string, category: string, journalistId: string, status: string, editorId: string, editor: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/review`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
            editorId: editorId,
        })
    });

    return await req.json();
}


// publishNews

export async function publishNews(newsId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/publish`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            status: status,
        })
    });

    return await req.json();
}



// archiveNews

export async function archiveNews(newsId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/archive`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            status: status,
        })
    });

    return await req.json();
}

//scheduleNews

export async function scheduleNews(newsId: string, title: string, text: string, category: string, journalistId: string, status: string, publishAt: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/schedule`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
            publishAt: publishAt
        })
    });

    return await req.json();
}


export async function rejectNews(newsId: string, title: string, text: string, category: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/reject`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}

export async function submitNews(newsId: string, title: string, text: string, category: string, journalistId: string, status: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}/submit`;
    const req = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            title: title,
            text: text,
            category: category,
            journalistId: journalistId,
            status: status,
        })
    });

    return await req.json();
}

export async function deleteNews(newsId: string): Promise<boolean> {
    const url = `${HOST}/news/${newsId}/delete`;
    const req = await fetch(url, {
        method: 'DELETE',
        headers: headers
    });

    return req.ok;
}

export async function getNews(newsId: string): Promise<NewsResource> {
    const url = `${HOST}/news/${newsId}`;
    const req = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    return await req.json();
}

export async function getNewsList(boardId: string): Promise<PainelResource> {
    const url = `${HOST}/board/${boardId}`;
    const options = {
        method: 'GET',
        headers: headers,
    };
    const response = await fetch(url, options);
    const newsList: PainelResource = await response.json();
    return newsList;
}


/**
 * Painel
 */

export async function getPanel(): Promise<PainelResource | null> {
    const url = `${HOST}/panel`;
    const response = await fetch(url);

    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}


/**
 * Board
 */

export async function getBoard(boardId: string): Promise<BoardResource> {
    const url = `${HOST}/board/${boardId}`;
    const options = {
        method: 'GET',
        headers: headers,
    };
    const response = await fetch(url, options);
    const board: BoardResource = await response.json();
    return board;

}

export async function createBoard(board: BoardResource): Promise<BoardResource | null> {
    const url = `${HOST}/board`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(board),
    });

    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}

export async function updateBoard(board: BoardResource): Promise<boolean> {
    const url = `${HOST}/board/${board.id}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(board),
    });

    return response.ok;
}

export async function deleteBoard(boardId: string): Promise<boolean> {
    const url = `${HOST}/board/${boardId}`;
    const response = await fetch(url, {
        method: 'DELETE',
    });

    return response.ok;
}


/**
 * User
 */

// create a new user

export async function createUser(name: string, email: string, password: string, role: string): Promise<UserResource> {
    const url = `${HOST}/user`;
    const req = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            role: role,
        })
    });

    return req.json();
}


// getUserById

export async function getUser(userId: string): Promise<UserResource> {

    const url = `${HOST}/user/${userId}`;
    const req = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    return await req.json();

}

/**
 * Feedbacks
 * 
    editorId: string,
    newsId: string,
    text: string, 
    createdAt?: string
 */

export async function createComment(editorId: string, newsId: string, text: string): Promise<boolean> {
    const url = `${HOST}/comment`;
    const req = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            editorId: editorId,
            newsId: newsId,
            text: text,
        })
    });

    return req.ok;
}


export async function deleteComment(commentId: string): Promise<boolean> {
    const url = `${HOST}/comment/${commentId}`;
    const req = await fetch(url, {
        method: 'DELETE',
        headers: headers
    });

    return req.ok;
}

export async function getComment(commentId: string): Promise<CommentResource> {
    const url = `${HOST}/comment/${commentId}`;
    const req = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    return await req.json();
}


export async function getFeedback(newsId: string): Promise<FeedbacksResource> {
    const url = `${HOST}/feedback/${newsId}`;
    const req = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    return await req.json();
}

/**
 * Login
 */


export type loginResource = {
    client_token: string;
    expires_at: string;
};

export async function login(email: string, password: string) {

    const url = `${HOST}/login`
    return await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

}




export function getUserIDFromJWT() {
    const cookie = Cookies.get("access_token");
    if (cookie) {
        const jwt: any = jwtDecode(cookie);
        const userId = jwt.sub;
        return userId;
    }
    return undefined;

}

export function getBoardIDFromJWT() {
    const cookie = Cookies.get("access_token");
    if (cookie) {
        const jwt: any = jwtDecode(cookie);
        const boardID = jwt.boardID;
        return boardID;
    }
    return undefined;

}

export function logout() {
    Cookies.remove("access_token");
}

interface UserIDContextType {
    userID: string | undefined;
    setUserID: (userID: string | undefined) => void
}
export const UserIDContext = React.createContext<UserIDContextType>({} as UserIDContextType);
export const useUserIDContext = () => React.useContext(UserIDContext)


interface BoardIDContextType {
    boardID: string | undefined;
    setBoardID: (boardID: string | undefined) => void
}
export const BoardIDContext = React.createContext<BoardIDContextType>({} as BoardIDContextType);
export const useBoardIDContext = () => React.useContext(BoardIDContext)