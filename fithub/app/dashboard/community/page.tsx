"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchPosts, fetchUserPosts, likePost } from "@/lib/api";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Plus,
  MoreHorizontal,
  Sparkles,
  Users,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@/types";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

interface UpdatedPost extends Post {
  isLiked?: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<UpdatedPost[]>([]);
  const [userPosts, setUserPosts] = useState<UpdatedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<UpdatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Helper function to process posts and add isLiked flag
  const processPostsWithLikeStatus = (posts: Post[]): UpdatedPost[] => {
    // Process each post to determine if it's liked by the current user
    return posts.map((post) => {
      // Check if the user has liked this post - in a real app this would use the current user ID
      // We're mocking this behavior here for demonstration purposes
      const currentUserId = post.currentUser?._id || "";
      const isLiked = post.likes.some((like) =>
        typeof like === "object"
          ? like._id === currentUserId
          : like === currentUserId
      );

      return {
        ...post,
        isLiked,
      };
    });
  };

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // Fetch all posts
        const allPostsResponse = await fetchPosts();
        const postsWithLikeStatus = processPostsWithLikeStatus(
          allPostsResponse.data.data
        );
        setPosts(postsWithLikeStatus);
        setFilteredPosts(postsWithLikeStatus);

        // Fetch user's posts
        const userPostsResponse = await fetchUserPosts();
        const userPostsWithLikeStatus = processPostsWithLikeStatus(
          userPostsResponse.data.data
        );
        setUserPosts(userPostsWithLikeStatus);
      } catch (error) {
        console.error("Error loading posts:", error);
        toast.error("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    const currentPosts = activeTab === "all" ? posts : userPosts;

    if (searchQuery.trim() === "") {
      setFilteredPosts(currentPosts);
    } else {
      const filtered = currentPosts.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, activeTab, posts, userPosts]);

  const handleCreatePost = () => {
    router.push("/dashboard/community/new");
  };

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/community/${postId}`);
  };

  const handleLikePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();

    try {
      await likePost(postId);

      // Update the post in all relevant state arrays
      const updatePostInArray = (postArray: UpdatedPost[]) => {
        return postArray.map((post) => {
          if (post._id === postId) {
            const isCurrentlyLiked = post.isLiked || false;
            // Create a properly typed updated post
            return {
              ...post,
              isLiked: !isCurrentlyLiked,
              likesCount: isCurrentlyLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
            };
          }
          return post;
        });
      };

      setPosts(updatePostInArray(posts));
      setUserPosts(updatePostInArray(userPosts));
      setFilteredPosts(updatePostInArray(filteredPosts));
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post. Please try again.");
    }
  };

  function renderPostsList() {
    return filteredPosts.map((post, index) => (
      <BlurFade key={post._id} delay={0.2 + index * 0.05} direction="up">
        <MagicCard
          className="cursor-pointer overflow-hidden group"
          onClick={() => handlePostClick(post._id)}
          hoverEffect="border"
        >
          <MagicCardContent className="px-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={post.author?.profilePicture} />
                <AvatarFallback>
                  {post.author?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {post.author?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {post.createdAt
                    ? format(new Date(post.createdAt), "MMM d, yyyy")
                    : "Unknown date"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.content}
                </p>
                {post.category && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 hover:bg-primary/20 text-primary border-none transition-colors"
                    >
                      {post.category}
                    </Badge>
                  </div>
                )}
              </div>
              {post.images && post.images.length > 0 && (
                <div className="hidden sm:block ml-4 shrink-0">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-muted">
                    <img 
                      src={post.images[0]} 
                      alt={post.title || "Post image"} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/10 ${post.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={(e) => handleLikePost(e, post._id)}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-primary text-primary' : 'fill-none'}`} 
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
    ));
  }

  return (
    <div className="space-y-6">

      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Fitness Community</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Community Feed
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect with other fitness enthusiasts
            </p>
          </div>
          <MagicButton
            onClick={handleCreatePost}
            hoverScale
            glowColor="rgba(var(--primary-rgb), 0.5)"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </MagicButton>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-8 focus:border-primary/60 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 md:w-[200px]">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                All Posts
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                My Posts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </BlurFade>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-6">{renderPostsList()}</div>
      ) : (
        <BlurFade delay={0.2} direction="up">
          <MagicCard className="text-center p-8" hoverEffect="glow">
            <MagicCardContent>
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-lg font-medium mb-2">No posts found</p>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all"
                  ? "Be the first to start a conversation!"
                  : "You haven't created any posts yet."}
              </p>
              <MagicButton onClick={handleCreatePost} sparkle>
                Create Your First Post
              </MagicButton>
            </MagicCardContent>
          </MagicCard>
        </BlurFade>
      )}
    </div>
  );
}
