import { NewsResource } from "./Resources";
import { News, NewsStatus } from "../model/NewsModel"
import { Types } from "mongoose"
import { User } from "../model/UserModel";
import { dateToString } from "./ServiceHelper";


export async function getNews(id: string): Promise<NewsResource> {
    const news = await News.findById(id).exec();

    if (news) {
        const journalist = await User.findById(news.journalistId).exec();

        if (journalist) {
            return {
                id: news.id,
                title: news.title,
                journalistId: news.journalistId.toString(),
                createdAt: dateToString(news.createdAt),
                text: news.text,
                category: news.category,
                status: news.status
            }
        } else {
            throw new Error(`Jornalist not found`);
        }

    } else {
        throw new Error(`No news with id ${id} found`);
    }



}


export async function createNews(newsResource: NewsResource): Promise<NewsResource> {

    const { title, text, journalistId, status, category } = newsResource;


    if (title && text && journalistId) {

        // check jornalist
        const journalist = await User.findById(newsResource.journalistId).exec();

        // create a news
        if (journalist) {
            const news = await News.create({
                journalistId: journalistId,
                title: title,
                text: text,
                category: category,
                status: NewsStatus.DRAFT
            });

            return {
                id: news.id,
                journalistId: news.journalistId.toString(),
                journalist: journalist.name,
                title: news.title,
                text: news.text,
                category: news.category,
                createdAt: dateToString(news.createdAt),
                status: NewsStatus.DRAFT
            }
        } else {
            throw new Error(`No news found`);
        }
    } else {
        throw new Error(`Invalid news data`);
    }

}

//scheduleNews
export async function scheduleNews(newsId: string,  publishAt?: string): Promise<NewsResource> {
    // find the news
    const news = await News.findById(newsId).exec();


    if (news && publishAt) {
        const date = Date.parse(publishAt);
        const publishDate = new Date(date)
        if (publishAt) news.publishAt = publishDate;
        news.status = NewsStatus.SCHEDULED
 
        const savedNews = await news.save();
        const journalist = await User.findById(savedNews.journalistId).exec();


        if (savedNews && journalist && savedNews.publishAt){

            return {
                id: news.id,
                journalistId: savedNews.journalistId.toString(),
                journalist: journalist.name,
                title: savedNews.title,
                text: savedNews.text,
                category: savedNews.category,
                createdAt: dateToString(savedNews.createdAt),
                status: savedNews.status,
                publishAt: dateToString(savedNews.publishAt),
            }
        } else {
            throw new Error(`Error: schedule News`);
        }

    } else {
        throw new Error(`No news with id ${newsId} found`);
    }
}

export async function updateNews(newsId: string, title: string, text: string, category: string, journalistId: string, status: string, editorId?: string, editorName?: string): Promise<NewsResource> {
   
    const journalist = await User.findById(journalistId).exec();
    if (!journalist) { throw new Error(`No journalist with id ${journalistId} found`); }

    let editorID;
    if(editorId){
        const editor = await User.findById(editorId).exec();
        if (!editor) { throw new Error(`No editor with id ${editorId} found`); }
        editorID = editor.id;
        editorName = editor.name
    }

    // find the news
    const news = await News.findById(newsId).exec();


    if (news) {
        if (title) news.title = title;
        if (text) news.text = text;
        if (status) {
            const newStatus : NewsStatus = status as NewsStatus;;
            news.status = newStatus;
        }
        if(editorID) news.editorId = editorID;
        if(category) news.category = category;



        const savedNews = await news.save();

        if (editorID && savedNews.editorId){
            return {
                id: news.id,
                journalistId: savedNews.journalistId.toString(),
                journalist: journalist.name,
                title: savedNews.title,
                text: savedNews.text,
                category: savedNews.category,
                createdAt: dateToString(savedNews.createdAt),
                status: savedNews.status,
                editorId: savedNews.editorId.toString(),
                editor: editorName
            }
        } else {
            return {
                id: news.id,
                journalistId: savedNews.journalistId.toString(),
                journalist: journalist.name,
                title: savedNews.title,
                text: savedNews.text,
                category: savedNews.category,
                createdAt: dateToString(savedNews.createdAt),
                status: savedNews.status,
            }
        }

    } else {
        throw new Error(`No news with id ${newsId} found`);
    }
}

export async function deleteNews(id: string): Promise<void> {
    const news = await News.findById(id).exec();
    if (!news) {
        throw new Error(`No news with id ${id} found, cannot delete`);
    }
    await News.deleteOne({ _id: new Types.ObjectId(news._id) }).exec();

}

