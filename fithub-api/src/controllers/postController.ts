import { Request, Response } from 'express';
import Post, { IPost } from '../models/Post';
import mongoose from 'mongoose';

// Get all posts with pagination
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const skip = (page - 1) * limit;

    let query = {};

    // If accessing my-posts route, must be authenticated
    if (req.path === '/my-posts') {
      if (!req.user) {
        return res.error('Not authenticated', 401);
      }
      query = { author: req.user.id };
    } else if (category) {
      query = { category };
    }

    const posts = await Post.find(query)
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.success({
      count: posts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.error('Server error while fetching posts', 500);
  }
};

// Get a single post by ID with comments
export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture')
      .populate('likes', 'name profilePicture');

    if (!post) {
      return res.error('Post not found', 404);
    }

    // Convert to plain object and add isEdit properties
    const postObject = post.toObject() as IPost & { isEdit?: boolean };

    // Add isEdit to the post itself
    postObject.isEdit = req.user?.id === postObject.author._id.toString();

    console.log(postObject);

    console.log(postObject.author._id);
    console.log(req.user);

    // Add isEdit to each comment
    postObject.comments = postObject.comments.map((comment: any) => ({
      ...comment,
      isEdit: req.user?.id === comment.author._id.toString(),
    }));

    res.success({ data: postObject });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.error('Server error while fetching post', 500);
  }
};

// Create new post
export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const newPost = new Post({
      ...req.body,
      author: req.user.id,
    });

    const post = await newPost.save();

    // Populate author details
    await post.populate('author', 'name profilePicture');

    res.success({ data: post }, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    res.error('Server error while creating post', 500);
  }
};

// Update a post (only author or admin)
export const updatePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.error('Post not found', 404);
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.error('Not authorized to update this post', 403);
    }

    // Don't allow changing the author
    delete req.body.author;

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name profilePicture');

    if (!updatedPost) {
      return res.error('Post not found', 404);
    }

    res.success({ data: updatedPost });
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      return res.error('Post not found', 404);
    }
    console.error('Error updating post:', error);
    res.error('Server error while updating post', 500);
  }
};

// Delete a post (only author or admin)
export const deletePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.error('Post not found', 404);
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.error('Not authorized to delete this post', 403);
    }

    await Post.deleteOne({ _id: req.params.id });

    res.success({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.error('Server error while deleting post', 500);
  }
};

// Add comment to a post
export const addComment = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: new mongoose.Types.ObjectId(req.user.id),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the author details for the newly added comment
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Edit a comment
export const editComment = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Find the comment
    const commentIndex = post.comments.findIndex(
      c => c._id && c._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Check if the user is the comment author or admin
    if (
      post.comments[commentIndex].author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this comment' });
    }

    // Update the comment
    post.comments[commentIndex].content = req.body.content;
    post.comments[commentIndex].updatedAt = new Date();

    await post.save();

    // Populate the author details
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    res.status(200).json({ success: true, data: populatedPost });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update post images
export const updatePostImages = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Check if user is the post author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
    }

    // Add new images
    if (req.body.images && Array.isArray(req.body.images)) {
      if (!post.images) {
        post.images = [];
      }
      post.images = [...post.images, ...req.body.images];
    }

    // Remove images
    if (req.body.removeImages && Array.isArray(req.body.removeImages)) {
      post.images = post.images.filter(img => !req.body.removeImages.includes(img));
    }

    await post.save();

    // Populate author details
    await post.populate('author', 'name profilePicture');

    res.success({ data: post });
  } catch (error) {
    console.error('Error updating post images:', error);
    res.error('Server error while updating post images', 500);
  }
};

// Toggle like on a post
export const toggleLike = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
