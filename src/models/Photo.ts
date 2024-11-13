import mongoose, { Schema, Document } from "mongoose";

export interface PhotoType extends Document {
  name: string;
  size: number;
  mime_type: string;
  uid: mongoose.Types.ObjectId;
  original_url: string;
  face_count: number;
  rekognition_face_id?: string;
}

const PhotoSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, required: true },
    mime_type: { type: String, required: true },
    original_url: { type: String, required: true },
    face_count: { type: Number, default: 0 },
    rekognition_face_id: { type: String }, // Store the Rekognition face ID
  },
  {
    timestamps: true,
  }
);

export const Photo = mongoose.model<PhotoType>("Photo", PhotoSchema);
