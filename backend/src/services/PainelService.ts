import { News, NewsStatus } from "../model/NewsModel";
import { User, UserRole } from "../model/UserModel";
import { PainelResource, NewsResource } from "./Resources";
import { dateToString } from "./ServiceHelper";


export type newsResources = {
    news: NewsResource[];
}

/**
 * Retrieves the panel (dashboard) data based on the user's role
 * @param userId The ID of the user
 * @returns A promise that resolves to a PainelResource object
 * @throws Error if the user is not found
 */
export async function getPainel(userId: string): Promise<PainelResource> {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const userRole = user.role;
    let filter = {};

    // Set filter based on user role
    switch (userRole) {
        case UserRole.EDITOR:
            filter = {
                $or: [
                    { status: NewsStatus.SUBMITTED },
                    {
                        editorId: userId,
                        status: {
                            $in: [
                                NewsStatus.IN_REVIEW,
                                NewsStatus.REJECTED,
                                NewsStatus.SCHEDULED,
                                NewsStatus.PUBLISHED,
                                NewsStatus.EDITED,
                                NewsStatus.ARCHIVED
                            ]
                        }
                    }
                ]
            };
            break;
        case UserRole.JOURNALIST:
            filter = {
                journalistId: userId,
                status: { $in: [NewsStatus.DRAFT, NewsStatus.SUBMITTED, NewsStatus.SCHEDULED, NewsStatus.PUBLISHED, NewsStatus.REJECTED] }
            };
            break;
        case UserRole.RADIO:
            filter = { status: NewsStatus.PUBLISHED };
            break;
        default:
            break;
    }

    // Find news articles based on the filter
    const newsList = await News.find(filter).exec();

    // Map news articles to NewsResource format
    const mappedArray = await Promise.all(
        newsList.map(async (element) => {
            const journalist = await User.findById(element.journalistId)
            const editor = await User.findById(element.editorId)

            return {
                id: element.id.toString(),
                title: element.title,
                text: element.text,
                category: element.category,
                journalistId: element.journalistId.toString(),
                journalist: journalist?.name!,
                createdAt: dateToString(element.createdAt),
                status: element.status,
                editorId: element.journalistId.toString(),
                editor: editor?.name!,
            }
        })
    );

    return {
        board: mappedArray
    }
}