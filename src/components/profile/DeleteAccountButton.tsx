import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DeleteAccountButton() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteAccount = async () => {
    try {
      if (!user) throw new Error("No user logged in")

      if (user.avatar) {
        const oldFilePath = user.avatar.split("/").pop()
        if (oldFilePath) {
          await supabase.storage.from("avatars").remove([oldFilePath])
        }
      }

      const { error: deleteError } = await supabase.from("profiles").delete().eq("user_id", user.id)

      if (deleteError) throw deleteError

      await logout()
      router.push("/login")
      toast({
        title: "Success",
        description: "Account deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <Trash className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-dark border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primaryaccent">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

