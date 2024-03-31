import { Schema, model, Types } from "mongoose"

// Enum representing the possible status of a news article
export enum NewsStatus {
    DRAFT = "Draft",
    SUBMITTED = "Submitted",
    IN_REVIEW = "In Review",
    REJECTED = "Rejected", 
    DELETED = "Deleted", 
    SCHEDULED = "Scheduled",  
    PUBLISHED = "Published",
    EDITED = "Edited",
    ARCHIVED = "Archived",
}

// Interface representing the structure of a news article
export interface INews{
    journalistId: Types.ObjectId; // ID of the journalist who created the news article
    editorId: Types.ObjectId | null; // ID of the editor who edited the news article 
    title: string; // Title of the news article
    text: string; // Text content of the news article
    category: string; // Category of the news article
    createdAt: Date; // Timestamp indicating the creation date of the news article
    publishAt: Date | undefined; // Timestamp indicating the publication date 
    status: NewsStatus; // Status of the news article 
}

// Define a Mongoose schema for the news article 
const newsSchema = new Schema<INews>({
    journalistId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    editorId: {type: Schema.Types.ObjectId, ref: "User", required: false},  
    title: {type: String, required: true},
    text: {type: String, required: true},
    category: {type: String, required: true},
    createdAt: {type: Date, timestamps: true, default: Date.now()},
    publishAt: {type: Date, timestamps: true},  
    status: { type: String, required: true, enum: Object.values(NewsStatus) }
});

// Create a Mongoose model for the "News" entity using the defined schema
export const News = model("News", newsSchema);
