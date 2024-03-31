import { NewsStatus } from "./model/NewsModel";
import { User, UserRole } from "./model/UserModel";
import { createBoard, getBoard } from "./services/BoardService";
import { BoardResource } from "./services/Resources";
import { createNews, updateNews } from "./services/NewsService";
import { createUser } from "./services/UsersService";


export async function prefillDB() {
    await User.syncIndexes();
    await createBoardJournalist2()
    await createBoardJournalist();
    await createBoardEditor();
    await createBoardEditor2();
    await createBoardRadio();
    console.log("------Test User--------")
    console.log("*** Jornalist 1 ***")
    console.log("email: john@journalist.de")
    console.log(" ")

    console.log("*** Jornalist 2 ***")
    console.log("email: ana@journalist.de")
    console.log(" ")

    console.log("*** Editor ***")
    console.log("email: elias@editor.de")
    console.log(" ")

    console.log("*** Radio ***")
    console.log("email: r@dio.de")
    console.log(" ")

    console.log("password´s user: 1234")
    console.log("----------------")

}

export async function createBoardJournalist(): Promise<BoardResource> {
    const john = await createUser({ name: "John", email: "john@journalist.de", password: "1234", role: UserRole.JOURNALIST })
    const journalistID = john.id!;

    const board = {
        owner: john.name,
        ownerId: journalistID
    }

    const title = "Lorem ipsum dolor sit amet consetetur sadipscing elitr "
    const text = " Lorem ipsum ed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.  Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.  Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer"
    const category = "Lorem ipsum"

    for (let m = 0; m < 5; m++) {
        await createNews(
            {
                title: "News " + m + " - " + title,
                text: text,
                category: category,
                journalistId: journalistID,
                status: NewsStatus.DRAFT
            })
    }
    return board;
}

export async function createBoardJournalist2(): Promise<BoardResource> {
    const john2 = await createUser({ name: "Ana", email: "ana@journalist.de", password: "1234", role: UserRole.JOURNALIST })
    const journalistID2 = john2.id!;

    const board = await getBoard(journalistID2)

    const title = "Lorem ipsum dolor sit amet consetetur sadipscing elitr "
    const text = " Lorem ipsum ed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.  Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.  Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer"
    const category = "Lorem ipsum"

    for (let m = 0; m < 5; m++) {
        await createNews(
            {
                title: "News " + m + " - " + title,
                text: text,
                category: category,
                journalistId: journalistID2,
                status: NewsStatus.DRAFT
            })
    }

    return board;
}

export async function createBoardEditor(): Promise<BoardResource> {
    const elias = await createUser({ name: "Elias", email: "elias@editor.de", password: "1234", role: UserRole.EDITOR })
    const editorID = elias.id!;

    const board = await getBoard(editorID)

    return board;
}

export async function createBoardEditor2(): Promise<BoardResource> {
    const elias = await createUser({ name: "Emanuel", email: "elias2@editor.de", password: "1234", role: UserRole.EDITOR })
    const editorID = elias.id!;

    const board = await getBoard(editorID)

    return board;
}

export async function createBoardRadio(): Promise<BoardResource> {
    const radio = await createUser({ name: "Radio", email: "r@dio.de", password: "1234", role: UserRole.RADIO })
    const radioID = radio.id!;

    const board = await getBoard(radioID)

    return board;
}