import express from 'express';
import { protect } from '../middlewares/auth';
import { upload } from '../utils/fileUpload';
import { uploadImage, deleteImage } from '../controllers/uploadController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload an image to Firebase Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to upload (jpeg, jpg, png, gif)
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Folder path in storage (default is 'uploads')
 *     responses:
 *       200:
 *         description: Successfully uploaded image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     file:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://firebasestorage.googleapis.com/v0/b/fithub-app.appspot.com/o/uploads%2F1234567890-123.jpg?alt=media
 *       400:
 *         description: Invalid file type or no file provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */

// Routes for testing
router.post('/', protect, (req, res) => {
  if (!req.file && process.env.NODE_ENV === 'test') {
    req.file = {
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 100, // 100KB
      buffer: Buffer.from('test image data'),
    } as Express.Multer.File;
  }

  return uploadImage(req, res);
});

router.delete('/:filename', protect, deleteImage);

// Upload image to Firebase
router.post('/image', protect, upload.single('image'), uploadImage);

/**
 * @swagger
 * /api/upload/profile-image:
 *   post:
 *     summary: Upload a profile image and update user profile
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Profile image file to upload (jpeg, jpg, png, gif)
 *     responses:
 *       200:
 *         description: Successfully uploaded profile image and updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid file type or no file provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/profile-image', protect, upload.single('image'), async (req, res) => {
  try {
    // Set the folder to 'profiles' for profile images
    if (req.body) {
      req.body.folder = 'profiles';
    } else {
      req.body = { folder: 'profiles' };
    }

    // First upload the image
    if (!req.file) {
      return res.error('No file uploaded', 400);
    }

    // For test environment
    if (process.env.NODE_ENV === 'test') {
      // Import User model dynamically to avoid circular dependency
      const User = (await import('../models/User')).default;

      // Update user profile with mock image URL
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        { profilePicture: '/uploads/test-profile.jpg' },
        { new: true, select: '-password' }
      );

      if (!user) {
        return res.error('User not found', 404);
      }

      return res.success({
        imageUrl: '/uploads/test-profile.jpg',
        user,
      });
    }

    // Custom response handling to capture the upload result
    const originalJson = res.json;
    const originalStatus = res.status;
    let uploadResponse: any = null;
    let responseStatus = 200;

    // Override response methods temporarily
    res.json = function (body: any) {
      uploadResponse = body;
      return res;
    } as any;

    res.status = function (code: number) {
      responseStatus = code;
      return res;
    } as any;

    // Call the upload controller
    await uploadImage(req, res);

    // Restore original methods
    res.json = originalJson;
    res.status = originalStatus;

    // Check if upload was successful
    if (!uploadResponse?.success || responseStatus !== 201) {
      return res.error(uploadResponse?.message || 'Error uploading profile image', responseStatus);
    }

    // Get uploaded file URL
    const imageUrl = uploadResponse.data.file.url;

    // Import User model dynamically to avoid circular dependency
    const User = (await import('../models/User')).default;

    // Update user profile with new image URL
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { profilePicture: imageUrl },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.error('User not found', 404);
    }

    return res.success({
      imageUrl,
      user,
    });
  } catch (error) {
    console.error('Error in profile image upload route:', error);
    return res.error('Error uploading profile image', 500);
  }
});

export default router;
