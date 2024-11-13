import { Request, Response } from "express";
import {
  RekognitionClient,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";
import { Photo } from "../models/Photo";
import { Face } from "../models/Face";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
});
const COLLECTION_ID = "photo-finder-demo"; // Your Rekognition collection ID


const SearchFacesController = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageParams = {
      Bytes: file.buffer, // Use the file buffer directly
    };

    const searchFacesCommand = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: imageParams,
      MaxFaces: 30,
      FaceMatchThreshold: 95, // Set the confidence threshold (0-100)
    });

    const searchResponse = await rekognitionClient.send(searchFacesCommand);

    const faceMatches = await Promise.all(
      (searchResponse.FaceMatches || []).map(async (match) => {
        const faces: any = await Face.find({
          rekognition_face_id: match.Face.FaceId,
        }).populate("photo_id");

        return faces.map((face: any) => face?.photo_id?.original_url);
      })
    );

    const imageUrls = faceMatches.flat();

    return res.status(200).json({
      imageUrls,
    });
  } catch (error: any) {
    console.error("Error searching faces:", error);
    res.status(500).json({ error: error.message || "Error searching faces" });
  }
};

export default SearchFacesController;
