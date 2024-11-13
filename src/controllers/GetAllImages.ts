import { Request, Response } from "express";
import { Photo } from "../models/Photo";

const GetAllImages = async (req: Request, res: Response) => {
  try {
    const Photos = await Photo.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Server is Alive", Photos });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
};

export default GetAllImages;
