"use client"

import { useState, useEffect } from "react"
import { Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/supabase"
import { useForm, Controller } from "react-hook-form"
import { format, differenceInDays, differenceInMonths, differenceInYears } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Driver {
  id: string
  name: string
  vehicle: string
  license_number: string
  license_expiry: string
  social_security: string
  join_date: string
  image_url: string
  created_by: string
}

const DriverComponent = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null)
  const [assignedVehicles, setAssignedVehicles] = useState<string[]>([])
  const { toast } = useToast()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      vehicle: "",
      license_number: "",
      license_expiry: "",
      social_security: "",
      join_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    const { data, error } = await supabase.from("drivers").select("*").order("name", { ascending: true })
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      })
      return
    }
    setDrivers(data as Driver[])

    // Extract unique vehicles from the drivers list
    const vehicles = [...new Set(data.map((driver) => driver.vehicle))]
    setAssignedVehicles(vehicles)
  }

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `driver-images/${fileName}`

    const { data, error } = await supabase.storage
      .from("driver-images")
      .upload(filePath, file, {
        onProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          setUploadProgress(progress)
        },
      })

    if (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return null
    }

    return `${supabase.storage.from("driver-images").getPublicUrl(filePath).data.publicUrl}`
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    let image_url = previewImage || ""

    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile)
      if (uploadedUrl) image_url = uploadedUrl
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    const driverData = {
      ...data,
      license_expiry: new Date(data.license_expiry).toISOString(),
      join_date: new Date(data.join_date).toISOString(),
      image_url,
      created_by: user?.id,
    }

    try {
      if (editingDriverId) {
        // Update existing driver
        const { data: updatedDriver, error } = await supabase
          .from("drivers")
          .update(driverData)
          .eq("id", editingDriverId)
          .select()

        if (error) throw error

        setDrivers((prev) =>
          prev.map((driver) => (driver.id === editingDriverId ? updatedDriver[0] : driver))
        )
        toast({
          title: "Driver Updated",
          description: "The driver has been successfully updated.",
        })
      } else {
        // Add new driver
        const { data: newDriver, error } = await supabase.from("drivers").insert([driverData]).select()

        if (error) throw error

        setDrivers((prev) => [...prev, newDriver[0] as Driver])
        toast({
          title: "Driver Added",
          description: "The driver has been successfully added.",
        })
      }

      setShowAddDriver(false)
      reset()
      setPreviewImage(null)
      setImageFile(null)
      setEditingDriverId(null)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleEditDriver = (driver: Driver) => {
    setEditingDriverId(driver.id)
    reset({
      name: driver.name,
      vehicle: driver.vehicle,
      license_number: driver.license_number,
      license_expiry: format(new Date(driver.license_expiry), "yyyy-MM-dd"),
      social_security: driver.social_security,
      join_date: format(new Date(driver.join_date), "yyyy-MM-dd"),
    })
    setPreviewImage(driver.image_url)
    setShowAddDriver(true)
  }

  const handleDeleteDriver = async (id: string) => {
    try {
      const { error } = await supabase.from("drivers").delete().eq("id", id)
      if (error) throw error

      setDrivers((prev) => prev.filter((driver) => driver.id !== id))
      toast({
        title: "Driver Deleted",
        description: "The driver has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to delete the driver",
        variant: "destructive",
      })
    }
  }

  const calculateDuration = (joinDate: string) => {
    const now = new Date()
    const join = new Date(joinDate)
    const days = differenceInDays(now, join)
    const months = differenceInMonths(now, join)
    const years = differenceInYears(now, join)
    return `${years}y ${months % 12}m ${days % 30}d`
  }

  return (
    <div className="flex flex-col h-screen bg-dark text-gray-light">
      <div className="flex-none p-6">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => {
              reset()
              setShowAddDriver(!showAddDriver)
            }}
            className="bg-primaryaccent text-dark hover:bg-primaryaccent/90"
          >
            <Plus className="mr-2 h-4 w-4" /> {showAddDriver ? "Close" : "Add Driver"}
          </Button>
        </div>

        {showAddDriver && (
          <Card className="bg-dark border-dark-border mb-6">
            <CardHeader>
              <CardTitle className="text-primaryaccent">
                {editingDriverId ? "Edit Driver" : "Add Driver"}
              </CardTitle>
              <CardDescription className="text-gray-muted">
                {editingDriverId ? "Update driver details" : "Enter driver details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-gray-light">Driver Name</label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="Enter driver name"
                          className="bg-dark-hover border-dark-border text-gray-light"
                          {...field}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="license_number" className="text-gray-light">License Number</label>
                    <Controller
                      name="license_number"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="Enter license number"
                          className="bg-dark-hover border-dark-border text-gray-light"
                          {...field}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="license_expiry" className="text-gray-light">License Expiry Date</label>
                    <Controller
                      name="license_expiry"
                      control={control}
                      render={({ field }) => (
                        <Input type="date" className="bg-dark-hover border-dark-border text-gray-light" {...field} />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="social_security" className="text-gray-light">Social Security Number</label>
                    <Controller
                      name="social_security"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="Enter Social Security Number"
                          className="bg-dark-hover border-dark-border text-gray-light"
                          {...field}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="join_date" className="text-gray-light">Join Date</label>
                    <Controller
                      name="join_date"
                      control={control}
                      render={({ field }) => (
                        <Input type="date" className="bg-dark-hover border-dark-border text-gray-light" {...field} />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicle" className="text-gray-light">Vehicle</label>
                    <Controller
                      name="vehicle"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-dark-hover border-dark-border text-gray-light">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignedVehicles.map((vehicle) => (
                              <SelectItem key={vehicle} value={vehicle}>
                                {vehicle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="image" className="text-gray-light">Driver Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-dark-hover border-dark-border text-gray-light"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        setPreviewImage(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {previewImage && (
                    <div className="mt-4">
                      <Image
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-24 h-24 object-cover rounded-md border border-dark-border"
                      />
                    </div>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-dark mt-2">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="h-2 bg-primaryaccent transition-all"
                    />
                  </div>
                )}

                <Button className="w-full bg-primaryaccent text-dark hover:bg-primaryaccent/90" type="submit" disabled={loading}>
                  {loading ? (editingDriverId ? "Saving Changes..." : "Adding Driver...") : (editingDriverId ? "Save Changes" : "Add Driver")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-grow overflow-auto p-6 pt-0">
        <Card className="bg-dark border-dark-border">
          <CardHeader>
            <CardTitle className="text-primaryaccent">Driver List</CardTitle>
            <CardDescription className="text-gray-muted">A list of all drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>License Expiry</TableHead>
                  <TableHead>Social Security</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-secondary">
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <Image
                        src={driver.image_url || "/placeholder.svg"}
                        alt={driver.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell>{driver.name}</TableCell>
                    <TableCell>{driver.vehicle}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>{format(new Date(driver.license_expiry), "yyyy-MM-dd")}</TableCell>
                    <TableCell>{driver.social_security}</TableCell>
                    <TableCell>{format(new Date(driver.join_date), "yyyy-MM-dd")}</TableCell>
                    <TableCell>{calculateDuration(driver.join_date)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-dark text-gray-light">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditDriver(driver)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDriver(driver.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DriverComponent