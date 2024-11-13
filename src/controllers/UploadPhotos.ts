import { Request, Response } from "express";
import { bulkUploadToS3 } from "../functions/bulkUploadToS3"; // Function to handle bulk upload to S3
import { Photo } from "../models/Photo"; // Photo model
import {
  RekognitionClient,
  IndexFacesCommand,
} from "@aws-sdk/client-rekognition";
import { Face } from "../models/Face"; // Face model

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
});

const UploadPhotosController = async (req: Request, res: Response) => {
  try {
    const files: any = req.files;
    console.log(files);
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files to upload" });
    }

    const uploadedOriginalFiles = await bulkUploadToS3("research", files);

    // Prepare photo records for MongoDB
    const photoRecords = await Promise.all(
      uploadedOriginalFiles.map(async (file: any) => {
        const photoRecord = {
          name: file.fileName,
          original_url: file.url,
          mime_type: file.mimetype,
          size: file.size,
        };
        return await Photo.create(photoRecord);
      })
    );

    await Promise.all(
      photoRecords.map(async (photoRecord) => {
        const params = {
          CollectionId: "photo-finder-demo",
          Image: {
            S3Object: {
              Bucket: process.env.AWS_BUCKET_NAME,
              Name: photoRecord.name,
            },
          },
        };

        const command = new IndexFacesCommand(params);
        const indexResponse = await rekognitionClient.send(command);

        const faceRecords = indexResponse.FaceRecords.map((faceRecord) => ({
          photo_id: photoRecord._id,
          rekognition_face_id: faceRecord.Face.FaceId,
        }));

        await Face.insertMany(faceRecords);

        // await Photo.findByIdAndUpdate(photoRecord._id, {
        //   face_count: faceRecords.length, // Update the face count
        //   is_processed: true, // Mark as processed
        //   processing_end_time: new Date(), // Set processing end time
        // });
      })
    );

    return res.status(200).json({
      message: "Images Uploaded and Indexed Successfully",
      photos: photoRecords,
    });
  } catch (error: any) {
    console.error("Error uploading photos:", error);
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
};

export default UploadPhotosController;
