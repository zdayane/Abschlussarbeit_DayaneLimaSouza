export type CommentResource = {
    id?: string
    editorId: string,
    newsId: string,
    text: string,
    createdAt?: string
}

export enum NewsCategory {
    Politics = 'Politics',
    Technology = 'Technology',
    Sports = 'Sports',
    Entertainment = 'Entertainment',
    Other = 'Other'
  }

export type FeedbacksResource = {
    board: CommentResource[]
}

export type PainelResource = {
    board: NewsResource[]
}

export type BoardResource = {
    id: string
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
    status: string
    editorId?: string
    editor?: string
}

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

export enum NewsStatusJournalist {
    DRAFT = "Draft",
    SUBMITTED = "Submitted",
    SCHEDULED = "Scheduled",
    PUBLISHED = "Published",
    REJECTED = "Rejected",
}

export enum NewsStatusEditor {
    SUBMITTED = "Submitted",
    IN_REVIEW = "In Review",
    REJECTED = "Rejected",
    SCHEDULED = "Scheduled",
    PUBLISHED = "Published",
    EDITED = "Edited",
    ARCHIVED = "Archived",
}

export enum NewsStatusRadio {
    PUBLISHED = "Published",
}


export enum UserRole {
    JOURNALIST = 'Journalist',  
    EDITOR = 'Editor',
    RADIO = 'Radio'
}


export type UserResource = {
    id?: string
    name: string
    email: string
    role: UserRole;
    password?: string
}
