import multer from 'multer';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import path from 'path';
import { Request } from 'express';

// Configure storage
const storageEngine = multer.memoryStorage();

// File filter to only allow certain image types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (allowedFileTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF are allowed.'));
  }
};

// Configure the multer middleware
export const upload = multer({
  storage: storageEngine,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param folderPath Path in Firebase Storage where the file should be stored
 * @returns Promise with the download URL of the uploaded file
 */
export const uploadFileToFirebase = async (
  file: Express.Multer.File,
  folderPath: string = 'uploads'
): Promise<string> => {
  try {
    // Create a unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(
      file.originalname
    )}`;
    const storageRef = ref(storage, `${folderPath}/${filename}`);

    // Create file metadata including the content type
    const metadata = {
      contentType: file.mimetype,
    };

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('Failed to upload file to storage');
  }
};

export default { upload, uploadFileToFirebase };
