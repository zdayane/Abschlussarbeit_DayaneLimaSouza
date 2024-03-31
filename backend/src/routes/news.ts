import express from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { INews, News, NewsStatus } from "../model/NewsModel";
import { createNews, deleteNews, getNews, scheduleNews, updateNews } from "../services/NewsService";
import { optionalAuthentication, requiresAuthentication } from "./authentification";
import { User, UserRole } from "../model/UserModel";

const newsRouter = express.Router();
const maxLength = 1000000;
const minLength = 1;

// validating news IDs
const validateNewsId = param('newsId').isMongoId();

// validating news parameters
const validateNewsParams = [
  body('title').isString(),
  body('text').isString(),
  body('category').isString(),
  body('journalistId').isMongoId(),
];

// validating status
const validateStatus = body('status');


// Route for getting a single news
newsRouter.get("/:newsId",
  validateNewsId,
  requiresAuthentication,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newsData = matchedData(req) as INews & { newsId: string };
      const news = await News.findById(newsData.newsId);
      res.send(news);
    } catch (err) {
      res.status(404);
      next(err);
    }
  });

// Route for creating a news
newsRouter.post("/",
  validateNewsParams,
  requiresAuthentication,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const userData = req.body;
      const user = await User.findById(userData.journalistId);
      if (!user || !user.hasRole(UserRole.JOURNALIST)) {
        return res.status(403).send("Unauthorized");
      }
      const news = await createNews(userData);
      res.status(201).send(news);
    } catch (err) {
      res.status(404);
      next(err);
    }
  });

//updating a news in draft state
newsRouter.put("/:newsId/draft",
  validateNewsId,
  validateNewsParams,
  validateStatus,
  requiresAuthentication,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    try {
      const news = await News.findById(newsId);

      if (!news) {
        return res.sendStatus(404);
      }

      // Check if the user is the journalist who created the news
      if (news.journalistId.toString() !== req.userId) {
        return res.status(403).send("Not your news");
      }

      // Update news if it's in DRAFT or REJECTED state
      if (news.status === NewsStatus.DRAFT || news.status === NewsStatus.REJECTED) {
        const { title, text, category, journalistId, status } = req.body;
        const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.DRAFT );
        return res.send(updatedNews);
      }
    } catch (err) {
      res.status(404);
      next(err);
    }
  });

// edit

newsRouter.put("/:newsId/edit",
  validateNewsId,
  validateNewsParams,
  validateStatus,
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }


    try {

      if (news.status === NewsStatus.IN_REVIEW) {

        const updatedNews = await News.findByIdAndUpdate(newsId, { status: NewsStatus.EDITED }, { new: true });
        res.send(updatedNews);

      } else if (news.status === NewsStatus.EDITED && news.editorId) {

        if (news.editorId.toString() !== req.userId) {
          res.status(403).send("You is not the Editor");
          return;
        }

        const { title, text, journalistId, status, category } = req.body;
        const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.EDITED);
        res.send(updatedNews); // 200 by default

      } else {
        return res.status(400).send("Cannot edit the news.");
      }

    } catch (err) {

      res.status(404);
      next(err);

    }
  })

newsRouter.put("/:newsId/submit",
  validateNewsId,
  validateNewsParams,
  body('status').isString().equals(NewsStatus.DRAFT),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }

    // Autorisierung
    if (news.journalistId.toString() !== req.userId) {
      res.status(403).send("Not your news");
      return;
    }

    try {

      const { title, text, journalistId, status, category } = req.body;
      const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.SUBMITTED);
      res.send(updatedNews); // 200 by default

    } catch (err) {

      res.status(404);
      next(err);

    }
  })


newsRouter.put("/:newsId/review",
  validateNewsId,
  validateNewsParams,
  validateStatus,
  body('editorId').isMongoId().optional(),
  body('editor').isString().optional(),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }

    try {

      const { title, text, category, journalistId, status, editorId, editor } = req.body;

      if (news.status === NewsStatus.PUBLISHED) {

        const updatedNews = await News.findByIdAndUpdate(newsId, { status: NewsStatus.IN_REVIEW }, { new: true });
        res.send(updatedNews);

      } else if (news.status === NewsStatus.EDITED) {

        const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.IN_REVIEW);
        res.send(updatedNews); // 200 by default

      } else if (news.status === NewsStatus.SUBMITTED) {

        const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.IN_REVIEW, editorId, editor);
        res.send(updatedNews); // 200 by default

      } else {
        return res.status(400).send("Cannot set the news in review.");
      }

    } catch (err) {

      res.status(404);
      next(err);

    }
  })

newsRouter.put("/:newsId/delete",
  validateNewsId,
  validateNewsParams,
  validateStatus,
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }


    try {

      if (news.status === NewsStatus.DRAFT || news.status === NewsStatus.REJECTED || news.status === NewsStatus.ARCHIVED) {

        const updatedNews = await News.findByIdAndUpdate(newsId, { status: NewsStatus.DELETED }, { new: true });
        res.send(updatedNews);

      } else if (news.status === NewsStatus.IN_REVIEW) {

        const { title, text, category, journalistId, status, editorId } = req.body;
        const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.DELETED, editorId);
        res.send(updatedNews); // 200 by default

      } else {
        return res.status(400).send("Cannot delete the news.");
      }


    } catch (err) {

      res.status(404);
      next(err);

    }
  }
);


newsRouter.put("/:newsId/schedule",
  validateNewsParams,
  validateNewsId,
  body('status').equals(NewsStatus.IN_REVIEW),
  body('publishAt').isString(),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }

    const { title, text, category, journalistId, status, publishAt } = req.body;

    try {
      const updatedNews = await scheduleNews(newsId, publishAt);
      res.send(updatedNews); // 200 by default

    } catch (err) {

      res.status(404);
      next(err);

    }
  })




newsRouter.put("/:newsId/reject",
  validateNewsId,
  validateNewsParams,
  body('status').equals(NewsStatus.IN_REVIEW),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }

    // Autorisierung von Redaktor ??
    /*
    if (news.journalistId.toString() !== req.userId) {
      res.status(403).send("Not your news");
      return;
    }
    */

    try {

      const { title, text, category, journalistId, status } = req.body;
      const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.REJECTED);
      res.send(updatedNews); // 200 by default

    } catch (err) {
      res.status(404);
      next(err);
    }
  }
);

newsRouter.put("/:newsId/reject",
  validateNewsId,
  validateNewsParams,
  body('status').equals(NewsStatus.IN_REVIEW),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);

    if (!news) {
      res.sendStatus(404);
      return;
    }

    // Autorisierung von Redaktor ??
    /*
    if (news.journalistId.toString() !== req.userId) {
      res.status(403).send("Not your news");
      return;
    }
    */

    try {

      const { title, text, journalistId, status, category } = req.body;
      const updatedNews = await updateNews(newsId, title, text, category, journalistId, NewsStatus.REJECTED);
      res.send(updatedNews); // 200 by default

    } catch (err) {
      res.status(404);
      next(err);
    }
  }
);

newsRouter.put("/:newsId/publish",
  validateNewsId,
  validateStatus,
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;
    const news = await News.findById(newsId);
    if (!news) {
      res.sendStatus(404);
      return;
    }

    try {
      if (news.status === NewsStatus.SCHEDULED ||
        news.status === NewsStatus.ARCHIVED) {
        const updatedNews = await News.findByIdAndUpdate(newsId, { status: NewsStatus.PUBLISHED }, { new: true });
        res.send(updatedNews);
      } else {
        return res.status(400).send("Cannot publish the news.");
      }

    } catch (err) {
      res.status(404);
      next(err);
    }
  }
);


newsRouter.put("/:newsId/archive",
  validateNewsId,
  body('status').equals(NewsStatus.PUBLISHED),
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const newsId = req.params.newsId;

    try {
      const updatedNews = await News.findByIdAndUpdate(newsId, { status: NewsStatus.ARCHIVED }, { new: true });
      res.send(updatedNews);
    } catch (err) {
      res.status(404);
      next(err);
    }
  }
);

newsRouter.delete("/:newsId/delete",
  validateNewsId,
  requiresAuthentication,

  async (req: express.Request, res: express.Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400)
        .json({ errors: errors.array() });
    }

    const msgID = req.params?.newsId;
    const news = await News.findById(msgID);
    if (!news) {
      res.sendStatus(404);
      return;
    }


    try {

      const newsData = matchedData(req) as INews & { newsId: string };
      const newsDeleted = await deleteNews(newsData.newsId);

      res.status(204);
      res.send(newsDeleted); // 200 by default

    } catch (err) {

      res.status(404);
      next(err);

    }
  })

export default newsRouter;

