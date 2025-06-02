"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchPostById, likePost, commentOnPost, editComment } from "@/lib/api";
import {
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Edit,
  Trash,
  Send,
  Check,
  X,
  MoreHorizontal,
  Heart,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Post, Comment } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

type Like = string | { _id: string; name: string };

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPostById(postId);
        setPost(response.data.data);
      } catch (error) {
        console.error("Error loading post:", error);
        toast.error("Failed to load post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;

    try {
      await likePost(post._id);

      // Update post with new like status
      const currentUserId = post.currentUser?._id;
      const isLiked = currentUserId
        ? post.likes.some((like: Like) =>
            typeof like === "string"
              ? like === currentUserId
              : like._id === currentUserId
          )
        : false;

      setPost({
        ...post,
        likes: isLiked
          ? post.likes.filter((like: Like) =>
              typeof like === "string"
                ? like !== currentUserId
                : like._id !== currentUserId
            )
          : ([...post.likes, currentUserId].filter(Boolean) as Like[]),
        likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to update like status.");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim() || !post) return;

    setIsSubmittingComment(true);
    try {
      const response = await commentOnPost(post._id, comment);

      // Update post with new comment
      setPost({
        ...post,
        comments: response.data.data.comments,
        commentsCount: (post.commentsCount || 0) + 1,
      });

      setComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEditComment = (commentToEdit: Comment) => {
    setEditingCommentId(commentToEdit._id);
    setEditedCommentContent(commentToEdit.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editedCommentContent.trim() || !post) return;

    setIsEditingComment(true);
    try {
      const response = await editComment(
        post._id,
        commentId,
        editedCommentContent
      );

      // Update post with edited comment
      setPost({
        ...post,
        comments: response.data.data.comments,
      });

      setEditingCommentId(null);
      setEditedCommentContent("");
      toast.success("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment. Please try again.");
    } finally {
      setIsEditingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>

        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-24 w-full" />

        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg mb-4">Post not found</p>
        <Button onClick={() => router.push("/dashboard/community")}>
          Back to Community
        </Button>
      </div>
    );
  }

  const isLiked = post.currentUser?._id
    ? post.likes.some((like: Like) =>
        typeof like === "string"
          ? like === post.currentUser?._id
          : like._id === post.currentUser?._id
      )
    : false;
  const canEdit = post.currentUser?._id === post.author._id;

  return (
    <div className="space-y-6">

      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Community Post</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Post Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View and interact with the community post
            </p>
          </div>
          <MagicButton
            variant="outline"
            onClick={() => router.push("/dashboard/community")}
            hoverScale
            glowColor="rgba(var(--primary-rgb), 0.3)"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </MagicButton>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <MagicCard hoverEffect="border">
          <MagicCardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.profilePicture} />
                  <AvatarFallback>
                    {post.author?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.author?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy • h:mm a")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.category && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-none transition-colors"
                  >
                    {post.category}
                  </Badge>
                )}
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/community/${post._id}/edit`)
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">{post.title}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {post.content}
              </p>
              {post.images && post.images.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/10 ${
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                onClick={handleLike}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isLiked ? "fill-primary text-primary" : "fill-none"
                  }`}
                />
                <span>{post.likes.length || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>{post.comments.length || 0}</span>
              </Button>
            </div>
          </MagicCardContent>
        </MagicCard>
      </BlurFade>

      <BlurFade delay={0.2} direction="up">
        <MagicCard hoverEffect="border">
          <MagicCardHeader>
            <h3 className="text-lg font-semibold">Comments</h3>
          </MagicCardHeader>
          <MagicCardContent>
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                />
                <MagicButton
                  type="submit"
                  disabled={isSubmittingComment || !comment.trim()}
                  hoverScale
                  glowColor="rgba(var(--primary-rgb), 0.5)"
                >
                  {isSubmittingComment ? (
                    <Send className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </MagicButton>
              </div>
            </form>

            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <Avatar>
                    <AvatarImage src={comment.author?.profilePicture} />
                    <AvatarFallback>
                      {comment.author?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {comment.author?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(comment.createdAt),
                            "MMM d, yyyy • h:mm a"
                          )}
                        </div>
                      </div>
                      {comment.author._id === post.currentUser?._id && (
                        <div className="flex items-center gap-2">
                          {editingCommentId === comment._id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSaveCommentEdit(comment._id)
                                }
                                disabled={isEditingComment}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditComment}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditComment(comment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment._id ? (
                      <Input
                        value={editedCommentContent}
                        onChange={(e) =>
                          setEditedCommentContent(e.target.value)
                        }
                        className="mt-2"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MagicCardContent>
        </MagicCard>
      </BlurFade>
    </div>
  );
}
