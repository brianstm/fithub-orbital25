"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchGyms,
  createGym,
  updateGym,
  deleteGym,
  uploadImage,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Plus,
  Search,
  Trash,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Gym } from "@/types";

const gymSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  openingHours: z.object({
    weekday: z.object({
      open: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in format HH:MM"),
      close: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in format HH:MM"),
    }),
    weekend: z.object({
      open: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in format HH:MM"),
      close: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in format HH:MM"),
    }),
  }),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  images: z.array(z.string()).optional(),
});

export default function AdminGymsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gymImages, setGymImages] = useState<string[]>([]);
  const [editGymImages, setEditGymImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const itemsPerPage = 10;

  const form = useForm({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      capacity: 50,
      openingHours: {
        weekday: { open: "06:00", close: "22:00" },
        weekend: { open: "08:00", close: "20:00" },
      },
      amenities: [],
      images: [],
    },
  });

  const editForm = useForm({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      capacity: 50,
      openingHours: {
        weekday: { open: "06:00", close: "22:00" },
        weekend: { open: "08:00", close: "20:00" },
      },
      amenities: [],
      images: [],
    },
  });

  useEffect(() => {
    // Redirect if user is not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }

    const loadGyms = async () => {
      setIsLoading(true);
      try {
        const response = await fetchGyms();
        setGyms(response.data.data);
        setFilteredGyms(response.data.data);
      } catch (error) {
        console.error("Error loading gyms:", error);
        toast.error("Failed to load gyms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === "admin") {
      loadGyms();
    }
  }, [user, router, toast]);

  useEffect(() => {
    let filtered = [...gyms];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (gym) =>
          gym.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gym.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGyms(filtered);
  }, [searchQuery, gyms]);

  const handleAddGym = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Add images to data
      const gymData = {
        ...data,
        images: gymImages,
      };

      const response = await createGym(gymData);
      setGyms([...gyms, response.data.data]);

      toast("The gym has been successfully added.");

      form.reset();
      setGymImages([]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding gym:", error);
      toast.error("Failed to add gym. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGym = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (!selectedGym?._id) return;

      // Add images to data and handle removed images
      const gymData = {
        ...data,
        images: editGymImages,
        removeImages: removedImages,
      };

      const response = await updateGym(selectedGym._id, gymData);

      // Update local state
      setGyms(
        gyms.map((gym) =>
          gym._id === selectedGym._id ? response.data.data : gym
        )
      );

      toast("The gym has been successfully updated.");

      setRemovedImages([]);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating gym:", error);
      toast.error("Failed to update gym. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGym = async () => {
    setIsSubmitting(true);
    try {
      if (!selectedGym?._id) return;
      await deleteGym(selectedGym._id);

      // Update local state
      setGyms(gyms.filter((gym) => gym._id !== selectedGym._id));

      toast("The gym has been successfully deleted.");

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting gym:", error);
      toast.error("Failed to delete gym. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (gym: Gym) => {
    setSelectedGym(gym);
    editForm.reset({
      name: gym.name,
      address: gym.address,
      description: gym.description,
      capacity: gym.capacity,
      openingHours: gym.openingHours,
      amenities: gym.amenities || [],
      images: gym.images || [],
    });

    // Set images for the edit form
    setEditGymImages(gym.images || []);
    setRemovedImages([]);

    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (gym: Gym) => {
    setSelectedGym(gym);
    setIsDeleteDialogOpen(true);
  };

  const addAmenity = (formHook: any) => {
    if (amenityInput.trim()) {
      const currentAmenities = formHook.getValues("amenities") || [];
      formHook.setValue("amenities", [
        ...currentAmenities,
        amenityInput.trim(),
      ]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number, formHook: any) => {
    const currentAmenities = formHook.getValues("amenities") || [];
    formHook.setValue(
      "amenities",
      currentAmenities.filter((_item: string, i: number) => i !== index)
    );
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploadingImage(true);

    try {
      // Upload each image
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const response = await uploadImage(file, "gyms");
        return response.data.data.file.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Add to appropriate images array based on whether we're editing or adding
      if (isEdit) {
        setEditGymImages([...editGymImages, ...uploadedUrls]);
      } else {
        setGymImages([...gymImages, ...uploadedUrls]);
      }

      toast.success("Images uploaded successfully!");
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (imageUrl: string, isEdit: boolean) => {
    if (isEdit) {
      // If image is already in the database, mark for removal on save
      if (selectedGym?.images?.includes(imageUrl)) {
        setRemovedImages([...removedImages, imageUrl]);
      }

      // Remove from current list
      setEditGymImages(editGymImages.filter((img) => img !== imageUrl));
    } else {
      // Simply remove from the local state for new gyms
      setGymImages(gymImages.filter((img) => img !== imageUrl));
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredGyms.length / itemsPerPage);
  const paginatedGyms = filteredGyms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/admin")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Gyms</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove gym facilities
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Gym
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gyms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search gyms..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border rounded-md"
                  >
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No gyms found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Amenities</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGyms.map((gym) => (
                      <TableRow key={gym._id}>
                        <TableCell className="font-medium">
                          {gym.name}
                        </TableCell>
                        <TableCell>{gym.address}</TableCell>
                        <TableCell>{gym.capacity}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {gym.amenities
                              ?.slice(0, 3)
                              .map((amenity: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {amenity}
                                </Badge>
                              ))}
                            {gym.amenities && gym.amenities.length > 3 && (
                              <Badge variant="outline">
                                +{gym.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(gym)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(gym)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          );
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Gym Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Gym</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new gym facility.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddGym)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Gym name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Gym address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the gym facilities"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of people allowed at once
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Weekday Hours</h3>

                  <FormField
                    control={form.control}
                    name="openingHours.weekday.open"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openingHours.weekday.close"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Weekend Hours</h3>

                  <FormField
                    control={form.control}
                    name="openingHours.weekend.open"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openingHours.weekend.close"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAmenity(form);
                          }
                        }}
                      />
                      <Button type="button" onClick={() => addAmenity(form)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeAmenity(index, form)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Images</FormLabel>
                <div className="mt-2 space-y-4">
                  {gymImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gymImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-md overflow-hidden h-36 bg-muted"
                        >
                          <img
                            src={image}
                            alt={`Gym image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveImage(image, false)}
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
                    <label
                      htmlFor="gym-image-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-sm py-2 px-4 border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Upload Images</span>
                      </div>
                      <input
                        id="gym-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, false)}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Gym"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Gym Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gym</DialogTitle>
            <DialogDescription>
              Update the details for this gym facility.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditGym)}
              className="space-y-6"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Gym name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Gym address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the gym facilities"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of people allowed at once
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Weekday Hours</h3>

                  <FormField
                    control={editForm.control}
                    name="openingHours.weekday.open"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="openingHours.weekday.close"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Weekend Hours</h3>

                  <FormField
                    control={editForm.control}
                    name="openingHours.weekend.open"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="openingHours.weekend.close"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAmenity(editForm);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addAmenity(editForm)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeAmenity(index, editForm)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Images</FormLabel>
                <div className="mt-2 space-y-4">
                  {editGymImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {editGymImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-md overflow-hidden h-36 bg-muted"
                        >
                          <img
                            src={image}
                            alt={`Gym image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveImage(image, true)}
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
                    <label
                      htmlFor="edit-gym-image-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-sm py-2 px-4 border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Upload Images</span>
                      </div>
                      <input
                        id="edit-gym-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Gym"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the gym "{selectedGym?.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGym}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
