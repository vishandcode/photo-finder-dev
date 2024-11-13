import { Router } from "express";
import UploadPhotosController from "../controllers/UploadPhotos";
import multer from "multer";
import SearchFacesController from "../controllers/SearchPhotos";
import GetAllImages from "../controllers/GetAllImages";

const PhotoRouter: any = Router();
const upload = multer();
PhotoRouter.post(
  "/upload-photos",
  upload.array("photos"),
  UploadPhotosController
);
PhotoRouter.post(
  "/search-photo",
  upload.single("photo"),
  SearchFacesController
);
PhotoRouter.get("/all", GetAllImages);

export default PhotoRouter;
