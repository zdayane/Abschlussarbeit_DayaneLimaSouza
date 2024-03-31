import { NewsStatus } from "src/model/NewsModel"

export type PainelResource = {
    board: NewsResource[]
}

export type  BoardResource = {
    id?: string
    owner?: string
    ownerId: string
}

export type NewsResource = {
    id?: string
    journalistId: string
    journalist?: string
    title: string
    text: string
    category: string
    createdAt?: string
    publishAt?: string
    status: NewsStatus
    editorId?: string
    editor?: string
}

export type CommentResource = {
    id?: string
    editorId: string
    newsId: string
    text: string
    createdAt?: string
}

export type FeedbacksResource = {
    board: CommentResource[]
}

export enum NewsStatusJournalist {
    DRAFT = "Draft",
    SUBMITTED = "Submitted",
    SCHEDULED = "Scheduled",
    PUBLISHED = "Published",
    REJECTED = "Rejected",
}



