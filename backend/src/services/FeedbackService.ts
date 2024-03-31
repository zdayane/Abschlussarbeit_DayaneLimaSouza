import { News } from "../model/NewsModel";
import { NewsResource, FeedbacksResource } from "./Resources";
import { dateToString } from "./ServiceHelper";
import { Comment } from "../model/CommentModel";

// definition for news resources
export type newsResources = {
    board: NewsResource[];
}

/**
 * Function to retrieve feedback for a news article
 * @param newsId The ID of the news article
 * @returns A promise that resolves to a FeedbacksResource object
 * @throws Error if the news article is not found
 */
export async function getFeedback(newsId: string): Promise<FeedbacksResource> {
    
    const news = await News.findById(newsId);
    if (!news) {
        throw new Error("News not found");
    }

    const commentList = await Comment.find({newsId: news.id}).exec();

    const mappedArray = await Promise.all(
        commentList.map(async (element) => {
            return {
                id: element.id.toString(),
                editorId: element.editorId.toString(),
                newsId: element.newsId.toString(),
                text: element.text,
                createdAt: dateToString(element.createdAt),
            }
        })
    );

    return {
        board: mappedArray
    }
}