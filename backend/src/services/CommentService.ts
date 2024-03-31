import { CommentResource } from "./Resources";
import { News } from "../model/NewsModel"
import { Types } from "mongoose"
import { Comment } from "../model/CommentModel";
import { dateToString } from "./ServiceHelper";
import { User, UserRole } from "../model/UserModel";

/**
 * Function to get a comment by ID
 * @param id The ID of the comment to retrieve
 * @returns A promise with the comment resource
 */
export async function getComment(id: string): Promise<CommentResource> {
    const comment = await Comment.findById(id).exec();

    if (comment) {

        const news = await News.findById(comment.newsId).exec();
        const editor = await User.findById(comment.editorId).exec();


        if (news && editor) {

            if (editor?.role === UserRole.EDITOR) {
                return {
                    id: comment.id,
                    editorId: news.journalistId.toString(),
                    newsId: news.journalistId.toString(),
                    createdAt: dateToString(news.createdAt),
                    text: comment.text,
                }

            } else {
                throw new Error(`No editor found`);
            }

        } else {
            throw new Error(`No news found`);
        }

    } else {
        throw new Error(`No comment with id ${id} found`);
    }

}

/**
 * Function to create a comment
 * @param commentResource The comment resource containing editorId, newsId, and text
 * @returns A promise with the created comment resource
 */
export async function createComment(commentResource: CommentResource): Promise<CommentResource> {

    const { editorId, newsId, text } = commentResource;

    if (editorId && newsId && text) {

        // check editor
        const editor = await User.findById(commentResource.editorId).exec();

        if (editor) {

            // check news
            const news = await News.findById(commentResource.newsId).exec();
            if (news) {

                // create a comment
                const newComment = await Comment.create({
                    editorId: editorId,
                    newsId: newsId,
                    text: text,
                });

                return {
                    id: newComment.id,
                    editorId: newComment.editorId.toString(),
                    newsId: newComment.newsId.toString(),
                    text: newComment.text,
                    createdAt: dateToString(newComment.createdAt),
                }

            } else {
                throw new Error(`No news with id ${commentResource.newsId} found`);
            }

        } else {
            throw new Error(`No Editor with id ${commentResource.editorId} found`);
        }
    } else {
        throw new Error(`No comment with id ${commentResource.id} found`);
    }

}

/**
 * Function to update a comment
 * @param commentResource The comment resource containing id, editorId, newsId, and text
 * @returns A promise with the updated comment resource
 */
export async function updateComment (commentResource: CommentResource) : Promise<CommentResource> {    
    // check editor
    const editor = await User.findById(commentResource.editorId).exec();
    if (!editor) {throw new Error(`No Editor with id ${commentResource.editorId} found`);}

    // check news
    const news = await News.findById(commentResource.newsId).exec();
    if (!news) {throw new Error(`No Editor with id ${commentResource.newsId} found`);}

    // check comment
    const comment = await Comment.findById(commentResource.id).exec();

    if (comment) {
        if (commentResource.text) comment.text = commentResource.text;

        const savedComment = await comment.save();

        return {
            id: savedComment.id,
            editorId: savedComment.editorId.toString(),
            newsId: savedComment.newsId.toString(),
            text: savedComment.text,
            createdAt: dateToString(savedComment.createdAt),
        }
    } else {
        throw new Error(`No comment with id ${commentResource.id} found`);
    }
}

/**
 * Function to delete a comment
 * @param id The ID of the comment to delete
 * @returns A promise that resolves when the comment is deleted
 */
export async function deleteComment(id: string): Promise<void> {
    const comment = await Comment.findById(id).exec();
    if (!comment) {
        throw new Error(`No comment with id ${id} found`);
    }
    await Comment.deleteOne({ _id: new Types.ObjectId(comment._id) }).exec();

}

