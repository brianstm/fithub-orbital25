import request from 'supertest';
import app from '../app';
import { createTestUser, createTestPost, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import { IPost } from '../models/Post';
import mongoose from 'mongoose';

describe('Post Routes', () => {
  describe('POST /api/posts', () => {
    let token: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
    });

    it('should create a post when authenticated', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', token)
        .send({
          title: 'Test Post',
          content: 'Test content',
          category: 'General',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Test Post');
      expect(response.body.data).toHaveProperty('author');
      expect(response.body.data.author).toHaveProperty('_id', (user._id as mongoose.Types.ObjectId).toString());
      expect(response.body.data.author).toHaveProperty('name', 'Test user');
    });

    it('should not create post without authentication', async () => {
      const response = await request(app).post('/api/posts').send({
        title: 'Test Post',
        content: 'Test content',
        category: 'General',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate post data', async () => {
      const response = await request(app).post('/api/posts').set('Authorization', token).send({
        title: '',
        content: '',
        category: 'InvalidCategory',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/posts', () => {
    let token: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      await createTestPost(user._id as mongoose.Types.ObjectId);
    });

    it('should get all posts when authenticated', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('title', 'Test Post');
    });

    it('should not get posts without authentication', async () => {
      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let token: string;
    let postId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const post = await createTestPost(user._id as mongoose.Types.ObjectId);
      postId = (post._id as mongoose.Types.ObjectId).toString();
    });

    it('should update post when authenticated', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', token)
        .send({
          title: 'Updated Post',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Updated Post');
      expect(response.body.data).toHaveProperty('content', 'Updated content');
    });

    it('should not update post without authentication', async () => {
      const response = await request(app).put(`/api/posts/${postId}`).send({
        title: 'Updated Post',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/posts/${fakeId}`)
        .set('Authorization', token)
        .send({
          title: 'Updated Post',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let token: string;
    let postId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const post = await createTestPost(user._id as mongoose.Types.ObjectId);
      postId = (post._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete post when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify post is deleted
      const getResponse = await request(app)
        .get(`/api/posts/${postId}`)
        .set('Authorization', token);
      expect(getResponse.status).toBe(404);
    });

    it('should not delete post without authentication', async () => {
      const response = await request(app).delete(`/api/posts/${postId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not delete non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', token);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/posts/:id/comments', () => {
    let token: string;
    let postId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const post = await createTestPost(user._id as mongoose.Types.ObjectId);
      postId = (post._id as mongoose.Types.ObjectId).toString();
    });

    it('should add a comment to a post when authenticated', async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', token)
        .send({
          content: 'Test comment',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comments');
      expect(response.body.data.comments.length).toBe(1);
      expect(response.body.data.comments[0]).toHaveProperty('content', 'Test comment');
    });

    it('should not add a comment without authentication', async () => {
      const response = await request(app).post(`/api/posts/${postId}/comments`).send({
        content: 'Test comment',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not add a comment to a non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/posts/${fakeId}/comments`)
        .set('Authorization', token)
        .send({
          content: 'Test comment',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/posts/:postId/comments/:commentId', () => {
    let token: string;
    let postId: string;
    let commentId: string;
    let user: mongoose.Document & IUser;
    let post: mongoose.Document & IPost;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      post = await createTestPost(user._id as mongoose.Types.ObjectId);
      postId = (post._id as mongoose.Types.ObjectId).toString();
      
      // Add a comment to the post
      post.comments.push({
        content: 'Original comment',
        author: user._id as mongoose.Types.ObjectId,
        createdAt: new Date()
      });
      await post.save();
      
      commentId = post.comments[0]._id!.toString();
    });

    it('should edit a comment when authenticated as the comment author', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}/comments/${commentId}`)
        .set('Authorization', token)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comments[0]).toHaveProperty('content', 'Updated comment');
      expect(response.body.data.comments[0]).toHaveProperty('updatedAt');
    });

    it('should not edit a comment without authentication', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}/comments/${commentId}`)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not edit a non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/posts/${postId}/comments/${fakeId}`)
        .set('Authorization', token)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/posts/:id/images', () => {
    let token: string;
    let postId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const post = await createTestPost(user._id as mongoose.Types.ObjectId);
      postId = (post._id as mongoose.Types.ObjectId).toString();
    });

    it('should add images to a post when authenticated', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}/images`)
        .set('Authorization', token)
        .send({
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('images');
      expect(response.body.data.images.length).toBe(2);
      expect(response.body.data.images).toContain('https://example.com/image1.jpg');
      expect(response.body.data.images).toContain('https://example.com/image2.jpg');
    });

    it('should remove images from a post when authenticated', async () => {
      // First add images
      await request(app)
        .put(`/api/posts/${postId}/images`)
        .set('Authorization', token)
        .send({
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        });
      
      // Then remove one image
      const response = await request(app)
        .put(`/api/posts/${postId}/images`)
        .set('Authorization', token)
        .send({
          removeImages: ['https://example.com/image1.jpg'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('images');
      expect(response.body.data.images.length).toBe(1);
      expect(response.body.data.images).toContain('https://example.com/image2.jpg');
      expect(response.body.data.images).not.toContain('https://example.com/image1.jpg');
    });

    it('should not update images without authentication', async () => {
      const response = await request(app).put(`/api/posts/${postId}/images`).send({
        images: ['https://example.com/image1.jpg'],
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not update images on a non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/posts/${fakeId}/images`)
        .set('Authorization', token)
        .send({
          images: ['https://example.com/image1.jpg'],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
