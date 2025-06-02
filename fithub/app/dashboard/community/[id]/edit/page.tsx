"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPostById, updatePost, updatePostImages, uploadImage } from "@/lib/api";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const editPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof editPostSchema>>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPostById(postId);
        const post = response.data.data;
        
        // Prefill the form with existing post data
        form.reset({
          title: post.title,
          content: post.content,
          category: post.category || "",
        });

        // Set post images
        if (post.images && post.images.length > 0) {
          setPostImages(post.images);
        }
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
  }, [postId, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingImage(true);
    const formData = new FormData();
    
    try {
      // Upload each image
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const response = await uploadImage(file, 'posts');
        return response.data.data.file.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Add to post images
      setPostImages([...postImages, ...uploadedUrls]);
      
      toast.success("Images uploaded successfully!");
      e.target.value = '';
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    // If image is already in the database, mark for removal on save
    if (postImages.includes(imageUrl)) {
      setRemovedImages([...removedImages, imageUrl]);
    }
    
    // Remove from current list
    setPostImages(postImages.filter(img => img !== imageUrl));
  };

  const onSubmit = async (data: z.infer<typeof editPostSchema>) => {
    setIsSubmitting(true);
    try {
      // First update post content
      await updatePost(postId, data);
      
      // Then update images if needed
      if (postImages.length > 0 || removedImages.length > 0) {
        await updatePostImages(postId, {
          images: postImages,
          removeImages: removedImages
        });
      }
      
      toast.success("Post updated successfully!");
      router.push(`/dashboard/community/${postId}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/community/${postId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription>
            Make changes to your post and save when you're done
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nutrition">Nutrition</SelectItem>
                        <SelectItem value="Workout">Workout</SelectItem>
                        <SelectItem value="Recovery">Recovery</SelectItem>
                        <SelectItem value="Motivation">Motivation</SelectItem>
                        <SelectItem value="Progress">Progress</SelectItem>
                        <SelectItem value="Question">Question</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Images</FormLabel>
                <div className="mt-2 space-y-4">
                  {postImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {postImages.map((image, index) => (
                        <div key={index} className="relative group rounded-md overflow-hidden h-36 bg-muted">
                          <img 
                            src={image} 
                            alt={`Post image ${index + 1}`} 
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveImage(image)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm py-2 px-4 border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Upload Images</span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                    
                    {isUploadingImage && (
                      <div className="ml-4 text-sm text-muted-foreground flex items-center">
                        <div className="animate-spin mr-2">⏳</div>
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2">⏳</div>
                    Updating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 