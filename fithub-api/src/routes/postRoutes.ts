import express from 'express';
import { check } from '../utils/validator';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  editComment,
  updatePostImages,
} from '../controllers/postController';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { UserRole } from '../models/User';

const router = express.Router();

// Post validation
const postValidation = [check('content').trim().notEmpty().withMessage('Post content is required')];

// Comment validation
const commentValidation = [
  check('content').trim().notEmpty().withMessage('Comment content is required'),
];

// Image validation
const imageValidation = [
  check('images').optional().isArray().withMessage('Images must be an array'),
  check('removeImages').optional().isArray().withMessage('removeImages must be an array'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Post ID
 *         title:
 *           type: string
 *           maxLength: 100
 *           description: Title of the post
 *         content:
 *           type: string
 *           description: Content of the post
 *         author:
 *           type: string
 *           description: User ID who created the post
 *         category:
 *           type: string
 *           description: Category of the post
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - content
 *               - author
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *               author:
 *                 type: string
 *                 description: User ID who made the comment
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp when the comment was created
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was last updated
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getPosts);

/**
 * @swagger
 * /api/posts/my-posts:
 *   get:
 *     summary: Get posts created by the authenticated user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/my-posts', protect, getPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getPost);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Title of the post
 *                 example: "My First Workout Experience"
 *               content:
 *                 type: string
 *                 description: Content of the post
 *                 example: "Just completed my first workout at FitLife Gym. The equipment is amazing!"
 *               category:
 *                 type: string
 *                 description: Category of the post
 *                 example: "Workout Experience"
 *     responses:
 *       201:
 *         description: Created post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, validate(postValidation), createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Title of the post
 *                 example: "Updated: My First Workout Experience"
 *               content:
 *                 type: string
 *                 description: Content of the post
 *                 example: "Just completed my first workout at FitLife Gym. The equipment is amazing and the trainers are very helpful!"
 *               category:
 *                 type: string
 *                 description: Category of the post
 *                 example: "Workout Experience"
 *     responses:
 *       200:
 *         description: Updated post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, validate(postValidation), updatePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     likesCount:
 *                       type: integer
 *                     message:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/:id/like', protect, toggleLike);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *                 example: "That's great! I've been going there for months and love it!"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           author:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     commentsCount:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comments', protect, validate(commentValidation), addComment);

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: Edit a comment on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to edit this comment
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
router.put('/:postId/comments/:commentId', protect, validate(commentValidation), editComment);

/**
 * @swagger
 * /api/posts/{id}/images:
 *   put:
 *     summary: Update images for a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs to add
 *               removeImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs to remove
 *     responses:
 *       200:
 *         description: Post images updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id/images', protect, validate(imageValidation), updatePostImages);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deletePost);

export default router;
