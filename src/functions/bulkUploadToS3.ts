import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateRandomString } from "./GenerateRandomString";

// Create an S3 client instance
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// Define a type for the file object
interface FileObject {
  buffer: Buffer; // Buffer containing the file data
  mimetype: string; // MIME type of the file
  originalName: string; // Original name of the file
  size: number; // Size of the file
  prefixedFileName?: string; // Optionally include a prefixed file name
}

/**
 * Uploads multiple files to AWS S3 in bulk and returns the URLs of the uploaded files.
 *
 * @param {string} folderName - The folder name where files will be uploaded.
 * @param {FileObject[]} files - An array of file objects to upload.
 * @returns {Promise<Array<{ fileName: string; url: string; size: number; mimeType: string }>>}
 * An array of objects containing the file names, their S3 URLs, and other details.
 */
export async function bulkUploadToS3(
  folderName: string,
  files: FileObject[]
): Promise<
  Array<{
    fileName: string;
    url: string;
    size: number;
    mimetype: string;
    prefixedFileName: string;
  }>
> {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME as string;

    if (!bucketName) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }

    const uploadPromises = files.map(async (file) => {
      const randomString = generateRandomString(20);
      const prefixedFileName = `${folderName}/${randomString}_${file.originalName}_${file.mimetype}`;

      const params = {
        Bucket: bucketName,
        Key: prefixedFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const objectUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${prefixedFileName}`;

      // Return the file name and its S3 URL
      return {
        fileName: prefixedFileName,
        url: objectUrl,
        size: file.size,
        mimetype: file.mimetype,
        prefixedFileName, // Include the prefixed file name in the returned object
      };
    });

    // Wait for all the files to be uploaded
    const uploadedFiles = await Promise.all(uploadPromises);

    console.log("Successfully uploaded files:", uploadedFiles);
    return uploadedFiles;
  } catch (error: any) {
    console.error("Error uploading files to S3:", error);
    throw new Error(`Error uploading files to S3: ${error.message}`); // Provide a more descriptive error message
  }
}
