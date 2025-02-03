"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Camera, Pencil, X } from "lucide-react"
import { supabase } from "@/supabase"
import { useToast } from "@/hooks/use-toast"
import imageCompression from "browser-image-compression"

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  role: string
  bio: string
  avatar: string
  company: string
  location: string
  department: string
  employeeId: string
}

interface ProfileHeaderProps {
  userData: UserData
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  setTempUserData: (userData: UserData) => void
  handleSaveChanges: () => void
}

export default function ProfileHeader({
  userData,
  isEditing,
  setIsEditing,
  setTempUserData,
  handleSaveChanges,
}: ProfileHeaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userData.avatar) {
      setImagePreview(userData.avatar)
    }
  }, [userData.avatar])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)

      setPendingAvatar(compressedFile)
      setIsUploading(false)
    } catch (error: any) {
      console.error("Error handling image selection:", error)
      toast({
        title: "Error",
        description: "Failed to process image.",
        variant: "destructive",
      })
      setImagePreview(null)
      setPendingAvatar(null)
      setIsUploading(false)
    }
  }

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const fileExt = pendingAvatar.name.split(".").pop()
      const fileName = `avatar-${userData.id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, pendingAvatar, {
          cacheControl: "3600",
          upsert: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          },
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Remove old avatar if exists
      if (userData.avatar) {
        const oldFilePath = userData.avatar.split("/").pop()
        if (oldFilePath) {
          const { error: removeError } = await supabase.storage.from("avatars").remove([oldFilePath])
          if (removeError) throw removeError
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.id)

      if (updateError) throw updateError

      setTempUserData((prev) => ({ ...prev, avatar: publicUrl }))
      setPendingAvatar(null)

      handleSaveChanges()

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })
    } catch (error: any) {
      console.error("Error handling image upload:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteAvatar = async () => {
    if (pendingAvatar) {
      setImagePreview(userData.avatar)
      setPendingAvatar(null)
      return
    }

    try {
      if (userData.avatar) {
        const oldFilePath = userData.avatar.split("/").pop()
        if (oldFilePath) {
          const { error: removeError } = await supabase.storage.from("avatars").remove([oldFilePath])
          if (removeError) throw removeError
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.id)

      if (updateError) throw updateError

      setImagePreview(null)
      setTempUserData((prev) => ({ ...prev, avatar: "" }))
      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      })
    } catch (error: any) {
      console.error("Error deleting avatar:", error)
      toast({
        title: "Error",
        description: "Failed to remove profile picture.",
        variant: "destructive",
      })
    }
  }

  const renderUploadProgress = () => {
    if (!isUploading) return null

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full absolute bg-black/50 rounded-full"></div>
        <div className="z-10 text-white text-lg font-bold">{uploadProgress}%</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {isEditing && pendingAvatar ? (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-gray-300">
              <AvatarImage src={userData.avatar || "/placeholder-avatar.jpg"} alt="Current profile picture" />
              <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <X className="w-6 h-6 text-red-500 cursor-pointer" onClick={handleDeleteAvatar} />
            </div>
          </div>

          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-green-500">
              <AvatarImage src={imagePreview || "/placeholder-avatar.jpg"} alt="New profile picture" />
              <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Avatar className="w-32 h-32">
            <AvatarImage src={imagePreview || userData.avatar || "/placeholder-avatar.jpg"} alt="Profile picture" />
            <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
          </Avatar>

          {isEditing && (
            <button
              onClick={handleDeleteAvatar}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {renderUploadProgress()}
        </div>
      )}

      <div className="flex justify-center items-center space-x-2">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-primaryaccent text-primary-foreground hover:bg-primaryaccent/90"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              className="bg-primaryaccent text-primary-foreground hover:bg-primaryaccent/90"
              disabled={isUploading}
            >
              <Label htmlFor="picture" className="cursor-pointer flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Change Picture"}
              </Label>
            </Button>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={isUploading}
            />
            {pendingAvatar && (
              <Button
                onClick={handleSaveAvatar}
                disabled={isUploading}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Save
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
