import mongoose, { Schema, Document } from "mongoose";
import { Photo } from "./Photo";

export interface FaceType extends Document {
  photo_id: mongoose.Types.ObjectId; // Reference to the associated photo
  rekognition_face_id: string;
}

const FaceSchema: Schema = new Schema(
  {
    photo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      required: true,
    },
    rekognition_face_id: { type: String, required: true }, // Store Rekognition face ID
  },
  {
    timestamps: true,
  }
);

// Update the face count in the associated Photo document
FaceSchema.post("save", async function () {
  try {
    const face = this as unknown as FaceType;

    const faceCount = await mongoose
      .model("Face")
      .countDocuments({ photo_id: face.photo_id });
    await Photo.findByIdAndUpdate(face.photo_id, { face_count: faceCount });
  } catch (error) {
    console.error("Error updating face count on photo:", error);
  }
});

export const Face = mongoose.model<FaceType>("Face", FaceSchema);
