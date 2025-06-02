"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MessageSquare, ThumbsUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchPosts } from "@/lib/api";
import { Post } from "@/types";
import { toast } from "sonner";

export function RecentPosts({ isLoading = false }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetchPosts();
        setPosts(response.data.data);
      } catch (error) {
        console.error("Error loading posts:", error);
        toast.error("Failed to load posts. Please try again.");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();
  }, []);

  if (isLoading || isLoadingPosts) {
    return (
      <div className="space-y-6">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No community posts found.</p>
        <Button
          className="mt-4"
          onClick={() => router.push("/dashboard/community")}
        >
          Create First Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.slice(0, 3).map((post) => (
        <div key={post._id} className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.author.profilePicture} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(post.createdAt), "MMM d, yyyy • h:mm a")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.category && (
                <Badge variant="outline">{post.category}</Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/dashboard/community/${post._id}`)
                    }
                  >
                    View Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <p className="mt-1 text-muted-foreground">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {post.images.slice(0, 2).map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden aspect-video bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
                {post.images.length > 2 && (
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      +{post.images.length - 2} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" disabled size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              {post.likesCount || post.likes?.length || 0}
            </Button>
            <Button variant="outline" disabled size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              {post.commentsCount || post.comments?.length || 0}
            </Button>
          </div>

          <Separator />
        </div>
      ))}

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/community")}
        >
          View All Posts
        </Button>
      </div>
    </div>
  );
}
