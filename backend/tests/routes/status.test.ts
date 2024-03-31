import DB from "../DB";
import supertest from "supertest";
import app from "../../src/app";
import { UserResource, createUser } from "../../src/services/UsersService";
import { BoardResource, NewsResource } from "../../src/services/Resources";
import { User, UserRole } from "../../src/model/UserModel";
import { INews, News, NewsStatus } from "../../src/model/NewsModel";
import { createNews, updateNews } from "../../src/services/NewsService";
import { Board } from "../../src/model/BoardModel";
import { jwtSuperTest, prepareJWTAccessToken } from "../JWTPreparedSuperTest";
import { updateBoard } from "src/services/BoardService";

let jornalist: UserResource
let jornalistID: string

let editor: UserResource
let editorID: string

let radio: UserResource
let radioID: string

let board: BoardResource
let boardID: string

let news: NewsResource
let newsID: string

const title = "jornalist 1 - News";
const text = "no content for news";
const category = "Sport"



const NON_EXISTING_ID = "635d2e796ea2f8c9bde5780c";

jest.useRealTimers();


beforeAll(async () => { 
    await DB.connect();
    await User.syncIndexes()
    await News.syncIndexes()
    await Board.syncIndexes()
})

beforeEach(async () => {
    await User.syncIndexes()
    await News.syncIndexes()
    await Board.syncIndexes()

    jornalist = await createUser(
        {
            name: "John",
            email: "john@jornalist.de",
            password: "ai-b@cju7hcre2sMx",
            role: UserRole.JOURNALIST,

        })
    jornalistID = jornalist.id!

    news = await createNews(
        {
            journalistId: jornalist.id!,
            title: title,
            text: text,
            category: category,
            status: NewsStatus.DRAFT
        })
    newsID = news.id!

    editor = await createUser(
        {
            name: "Elias",
            email: "elias@editor.de",
            password: "ai-b@cju7hcre2sMx",
            role: UserRole.EDITOR,

        })
    editorID = editor.id!


    radio = await createUser(
        {
            name: "Radiosender",
            email: "r@dio.de",
            password: "ai-b@cju7hcre2sMx",
            role: UserRole.RADIO,
        })
    radioID = radio.id!
})
afterEach(async () => { 
    jest.useRealTimers();
    await DB.clear(); 
})

afterAll(async () => {
    await DB.close()
})

test("GET, create a new (Status: DRAFT)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const response = await jwtSuperTest(app).get(`/news/${newsID}`);    
    expect(response.statusCode).toBe(200);
    
    const newsRes = response.body;
    expect(newsRes.status).toEqual(NewsStatus.DRAFT);
});

test("PUT - update news (Status: DRAFT -> DRAFT)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    
    const newTitle =  "Title - hier is the new title";
    const response = await jwtSuperTest(app).put(`/news/${newsID}/draft`).send({
        id: newsID,
        title: newTitle,
        text: "no content for news ",
        category: "Sport",
        journalistId: jornalist.id!,
        status: NewsStatus.DRAFT

    });
        
    const myNews: INews & {newid: string} = response.body;  
    expect(myNews.title).toEqual(newTitle);
    expect(myNews.status).toEqual(NewsStatus.DRAFT);
});


test("PUT - submit news (Status: DRAFT -> SUBMITTED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
        
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);
});

test("DELETE - update news (Status: DRAFT -> DELETE)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    
    const newTitle =  "Title - hier is the new title";
    const response = await jwtSuperTest(app).delete(`/news/${newsID}/delete`).send({
        id: newsID,
        title: newTitle,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status

    });
        
    expect(response.statusCode).toBe(204);
});

test("PUT - set a news in review (Status: SUBMITTED -> IN REVIEW)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: myNewsSUBMIT.status
    });
        
    const myNews: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNews.status).toEqual(NewsStatus.IN_REVIEW);
});

test("PUT - reject a news (Status: IN REVIEW -> REJECTED )", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")

    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);


    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: myNewsSUBMIT.status
    });

    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const responseREJECTED = await jwtSuperTest(app).put(`/news/${newsID}/reject`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status
    });
        
    const myNewsREJECTED : INews & {newid: string} = responseREJECTED.body;  
    expect(myNewsREJECTED.status).toEqual(NewsStatus.REJECTED);
});

test("PUT - send rejected news back to jornalist (Status: REJECTED -> DRAFT )", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")

    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);


    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: myNewsSUBMIT.status
    });

    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const responseREJECTED = await jwtSuperTest(app).put(`/news/${newsID}/reject`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status
    });
    const myNewsREJECTED : INews & {newid: string} = responseREJECTED.body;  
    expect(myNewsREJECTED.status).toEqual(NewsStatus.REJECTED);

    const responseDRAFT = await jwtSuperTest(app).put(`/news/${newsID}/draft`).send({
        id: newsID,
        title: myNewsREJECTED.title,
        text: myNewsREJECTED.text,
        category: myNewsREJECTED.category,
        journalistId: myNewsREJECTED.journalistId,
        status: myNewsREJECTED.status
    });

    const myNewsDRAFT : INews & {newid: string} = responseDRAFT.body;  
    expect(myNewsDRAFT.status).toEqual(NewsStatus.DRAFT);
});

test("DELETE - delete news in review (Status: IN REVIEW -> DELETED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status,
        editorId: editor.id!,
        editor: editor.name
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: myNewsSUBMIT.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const responseDELETED = await jwtSuperTest(app).delete(`/news/${newsID}/delete`)
    expect(responseDELETED.statusCode).toBe(204);
});

test("PUT - edit a news (Status: IN REVIEW -> EDITED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const responseEDITED = await jwtSuperTest(app).put(`/news/${newsID}/edit`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: myNewsSUBMIT.status
    });
        
    const myNews: INews & {newid: string} = responseEDITED.body;  
    expect(myNews.status).toEqual(NewsStatus.EDITED);
});

test("PUT - edit a news (Status: EDITED -> EDITED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const newTitle =  "Title - hier is the new title";
    const responseEDITED = await jwtSuperTest(app).put(`/news/${newsID}/edit`).send({
        id: newsID,
        title: newTitle,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
        
    const myNews: INews & {newid: string} = responseEDITED.body;  
    expect(myNews.status).toEqual(NewsStatus.EDITED);
});

test("PUT - set edited news back to review (Status: EDITED -> IN REVIEW )", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const newTitle =  "Title - hier is the new title";
    const responseEDITED = await jwtSuperTest(app).put(`/news/${newsID}/edit`).send({
        id: newsID,
        title: newTitle,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsEDITED: INews & {newid: string} = responseEDITED.body;  
    expect(myNewsEDITED.status).toEqual(NewsStatus.EDITED);

    const responseINREVIEWagain = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsINREVIEW2: INews & {newid: string} = responseINREVIEWagain.body;  
    expect(myNewsINREVIEW2.status).toEqual(NewsStatus.IN_REVIEW);
});


test("PUT - schedule the publication of a news (Status: IN REVIEW -> SCHEDULED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    });
        
    const myNewsSCHEDULED: INews & {newid: string} = responseSCHEDULED.body;  
    expect(myNewsSCHEDULED.status).toEqual(NewsStatus.SCHEDULED);
});


test("PUT - publish a news (Status: SCHEDULED -> PUBLISHED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    });
    const myNewsSCHEDULED: INews & {newid: string} = responseSCHEDULED.body;  
    expect(myNewsSCHEDULED.status).toEqual(NewsStatus.SCHEDULED);

    const responsePUBLISHED = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: myNewsSCHEDULED.title,
        text: myNewsSCHEDULED.text,
        category: myNewsSCHEDULED.category,
        journalistId: myNewsSCHEDULED.journalistId,
        status: myNewsSCHEDULED.status
    });
        
    const myNewsPUBLISHED: INews & {newid: string} = responsePUBLISHED.body;  
    expect(myNewsPUBLISHED.status).toEqual(NewsStatus.PUBLISHED);
});



test("PUT - send published news back to review (Status: PUBLISHED -> IN REVIEW)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    });
    const myNewsSCHEDULED: INews & {newid: string} = responseSCHEDULED.body;  
    expect(myNewsSCHEDULED.status).toEqual(NewsStatus.SCHEDULED);

    const responsePUBLISHED = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: myNewsSCHEDULED.title,
        text: myNewsSCHEDULED.text,
        category: myNewsSCHEDULED.category,
        journalistId: myNewsSCHEDULED.journalistId,
        status: myNewsSCHEDULED.status
    });   
    const myNewsPUBLISHED: INews & {newid: string} = responsePUBLISHED.body;  
    expect(myNewsPUBLISHED.status).toEqual(NewsStatus.PUBLISHED);

    const responseINREVIEWagain = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsPUBLISHED.title,
        text: myNewsPUBLISHED.text,
        category: myNewsPUBLISHED.category,
        journalistId: myNewsPUBLISHED.journalistId,
        status: myNewsPUBLISHED.status
    });   
    const myNewsINREVIEW2: INews & {newid: string} = responseINREVIEWagain.body;  
    expect(myNewsINREVIEW2.status).toEqual(NewsStatus.IN_REVIEW);
});

test("PUT - archive a news (Status: PUBLISHED -> ARCHIVED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const myNewsSUBMIT: INews & {newid: string} = responseSUBMIT.body;  
    expect(myNewsSUBMIT.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: myNewsSUBMIT.title,
        text: myNewsSUBMIT.text,
        category: myNewsSUBMIT.category,
        journalistId: myNewsSUBMIT.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    }); 
    const myNewsSCHEDULED: INews & {newid: string} = responseSCHEDULED.body;  
    expect(myNewsSCHEDULED.status).toEqual(NewsStatus.SCHEDULED);

    const responsePUBLISHED = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: myNewsSCHEDULED.title,
        text: myNewsSCHEDULED.text,
        category: myNewsSCHEDULED.category,
        journalistId: myNewsSCHEDULED.journalistId,
        status: myNewsSCHEDULED.status
    });
    const myNewsPUBLISHED: INews & {newid: string} = responsePUBLISHED.body;  
    expect(myNewsPUBLISHED.status).toEqual(NewsStatus.PUBLISHED);

    const responseARCHIVED = await jwtSuperTest(app).put(`/news/${newsID}/archive`).send({
        id: newsID,
        title: myNewsPUBLISHED.title,
        text: myNewsPUBLISHED.text,
        category: myNewsPUBLISHED.category,
        journalistId: myNewsPUBLISHED.journalistId,
        status: myNewsPUBLISHED.status
    });   
    const myNewsARCHIVED: INews & {newid: string} = responseARCHIVED.body;  
    expect(myNewsARCHIVED.status).toEqual(NewsStatus.ARCHIVED);

});


test("PUT - delete archived news (Status: ARCHIVED -> DELETED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const mySubmittedNews: INews & {newid: string} = responseSUBMIT.body;  
    expect(mySubmittedNews.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: mySubmittedNews.title,
        text: mySubmittedNews.text,
        category: mySubmittedNews.category,
        journalistId: mySubmittedNews.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    }); 
    const mySheduledNews: INews & {newid: string} = responseSCHEDULED.body;  
    expect(mySheduledNews.status).toEqual(NewsStatus.SCHEDULED);

    const responsePUBLISHED = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: mySheduledNews.title,
        text: mySheduledNews.text,
        category: mySheduledNews.category,
        journalistId: mySheduledNews.journalistId,
        status: mySheduledNews.status
    });
    const myPublishedNews: INews & {newid: string} = responsePUBLISHED.body;  
    expect(myPublishedNews.status).toEqual(NewsStatus.PUBLISHED);

    const responseARCHIVED = await jwtSuperTest(app).put(`/news/${newsID}/archive`).send({
        id: newsID,
        title: myPublishedNews.title,
        text: myPublishedNews.text,
        category: myPublishedNews.category,
        journalistId: myPublishedNews.journalistId,
        status: myPublishedNews.status
    });   
    const myArchivedNews: INews & {newid: string} = responseARCHIVED.body;  
    expect(myArchivedNews.status).toEqual(NewsStatus.ARCHIVED);

    const responseDELETED = await jwtSuperTest(app).delete(`/news/${newsID}/delete`)
    expect(responseDELETED.statusCode).toBe(204);

});

test("PUT - publish archived news (Status: ARCHIVED -> PUBLISHED)", async () => {
    await prepareJWTAccessToken(jornalist.email, "ai-b@cju7hcre2sMx")
    const responseSUBMIT = await jwtSuperTest(app).put(`/news/${newsID}/submit`).send({
        id: newsID,
        title: news.title,
        text: news.text,
        category: news.category,
        journalistId: news.journalistId,
        status: news.status
    });
    const mySubmittedNews: INews & {newid: string} = responseSUBMIT.body;  
    expect(mySubmittedNews.status).toEqual(NewsStatus.SUBMITTED);

    //await prepareJWTAccessToken(editor.email, "ai-b@cju7hcre2sMx")
    const responseINREVIEW = await jwtSuperTest(app).put(`/news/${newsID}/review`).send({
        id: newsID,
        title: mySubmittedNews.title,
        text: mySubmittedNews.text,
        category: mySubmittedNews.category,
        journalistId: mySubmittedNews.journalistId,
        status: news.status
    });
    const myNewsINREVIEW: INews & {newid: string} = responseINREVIEW.body;  
    expect(myNewsINREVIEW.status).toEqual(NewsStatus.IN_REVIEW);

    const publishNow = new Date(Date.now());
    const responseSCHEDULED = await jwtSuperTest(app).put(`/news/${newsID}/schedule`).send({
        id: newsID,
        title: myNewsINREVIEW.title,
        text: myNewsINREVIEW.text,
        category: myNewsINREVIEW.category,
        journalistId: myNewsINREVIEW.journalistId,
        status: myNewsINREVIEW.status,
        publishAt: publishNow.toDateString()
    }); 
    const mySheduledNews: INews & {newid: string} = responseSCHEDULED.body;  
    expect(mySheduledNews.status).toEqual(NewsStatus.SCHEDULED);

    const responsePUBLISHED = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: mySheduledNews.title,
        text: mySheduledNews.text,
        category: mySheduledNews.category,
        journalistId: mySheduledNews.journalistId,
        status: mySheduledNews.status
    });
    const myPublishedNews: INews & {newid: string} = responsePUBLISHED.body;  
    expect(myPublishedNews.status).toEqual(NewsStatus.PUBLISHED);

    const responseARCHIVED = await jwtSuperTest(app).put(`/news/${newsID}/archive`).send({
        id: newsID,
        title: myPublishedNews.title,
        text: myPublishedNews.text,
        category: myPublishedNews.category,
        journalistId: myPublishedNews.journalistId,
        status: myPublishedNews.status
    });   
    const myArchivedNews: INews & {newid: string} = responseARCHIVED.body;  
    expect(myArchivedNews.status).toEqual(NewsStatus.ARCHIVED);

    const responsePUBLISHEDagain = await jwtSuperTest(app).put(`/news/${newsID}/publish`).send({
        id: newsID,
        title: myArchivedNews.title,
        text: myArchivedNews.text,
        category: myArchivedNews.category,
        journalistId: myArchivedNews.journalistId,
        status: myArchivedNews.status
    });
    const myPublishedNews2: INews & {newid: string} = responsePUBLISHEDagain.body;  
    expect(myPublishedNews2.status).toEqual(NewsStatus.PUBLISHED);
});





