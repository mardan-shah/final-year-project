"use client"

import { useState, useEffect } from "react"
import { Pen, ChevronDown, MoreVertical, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/supabase"
import { useToast } from "@/hooks/use-toast"

interface Ticket {
  id: string
  vehicle: string
  issue: string
  priority: string
  status: string
  cost: number
  created_by: string
  created_at: string
}

interface FuelUpdate {
  id: string
  vehicle: string
  quantity: number
  cost: number
  distance: number
  created_by: string
  created_at: string
}

interface Vehicle {
  id: string
  name: string
  total_distance: number
  total_fuel_cost: number
  total_maintenance_cost: number
}

const MaintenanceComponent = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [fuelUpdates, setFuelUpdates] = useState<FuelUpdate[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [editingTicket, setEditingTicket] = useState<string | null>(null)
  const [editingFuelUpdate, setEditingFuelUpdate] = useState<string | null>(null)
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false)
  const [isUploadFuelOpen, setIsUploadFuelOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
    fetchFuelUpdates()
    fetchVehicles()
  }, [])

  const fetchTickets = async () => {
    const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      })
      return
    }
    setTickets(data as Ticket[])
  }

  const fetchFuelUpdates = async () => {
    const { data, error } = await supabase.from("fuel_updates").select("*").order("created_at", { ascending: false })
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch fuel updates",
        variant: "destructive",
      })
      return
    }
    setFuelUpdates(data as FuelUpdate[])
  }

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from("vehicles").select("*")
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      })
      return
    }
    setVehicles(data as Vehicle[])
  }

  const handleAddTicket = async (newTicket: Omit<Ticket, "id" | "created_by">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    // Fetch the selected vehicle
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", newTicket.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found or multiple vehicles with the same name exist.",
        variant: "destructive",
      })
      return
    }

    // Add the ticket
    const { data, error } = await supabase
      .from("tickets")
      .insert([{ ...newTicket, created_by: user.id }])
      .select()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add ticket",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total maintenance cost
    const updatedVehicle = {
      total_maintenance_cost: vehicleData.total_maintenance_cost + newTicket.cost,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setTickets((prev) => [data[0], ...prev])
    toast({
      title: "Ticket Added",
      description: "The ticket has been successfully added.",
    })
  }

  const handleEditTicket = async (id: string, updatedTicket: Partial<Ticket>) => {
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single()

    if (ticketError || !ticketData) {
      toast({
        title: "Error",
        description: "Ticket not found.",
        variant: "destructive",
      })
      return
    }

    // Fetch the vehicle associated with the ticket
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", ticketData.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found.",
        variant: "destructive",
      })
      return
    }

    // Calculate the difference in cost
    const costDifference = (updatedTicket.cost || 0) - ticketData.cost

    // Update the ticket
    const { data, error } = await supabase
      .from("tickets")
      .update(updatedTicket)
      .eq("id", id)
      .select()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total maintenance cost
    const updatedVehicle = {
      total_maintenance_cost: vehicleData.total_maintenance_cost + costDifference,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? data[0] : ticket)))
    setEditingTicket(null)
    toast({
      title: "Ticket Updated",
      description: "The ticket has been successfully updated.",
    })
  }

  const handleDeleteTicket = async (id: string) => {
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single()

    if (ticketError || !ticketData) {
      toast({
        title: "Error",
        description: "Ticket not found.",
        variant: "destructive",
      })
      return
    }

    // Fetch the vehicle associated with the ticket
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", ticketData.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found.",
        variant: "destructive",
      })
      return
    }

    // Delete the ticket
    const { error } = await supabase.from("tickets").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total maintenance cost
    const updatedVehicle = {
      total_maintenance_cost: vehicleData.total_maintenance_cost - ticketData.cost,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id))
    toast({
      title: "Ticket Deleted",
      description: "The ticket has been successfully deleted.",
    })
  }

  const handleAddFuelUpdate = async (newFuelUpdate: Omit<FuelUpdate, "id" | "created_by">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    // Fetch the selected vehicle
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", newFuelUpdate.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found or multiple vehicles with the same name exist.",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total distance and fuel cost
    const updatedVehicle = {
      total_distance: vehicleData.total_distance + newFuelUpdate.distance,
      total_fuel_cost: vehicleData.total_fuel_cost + newFuelUpdate.cost,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Add the fuel update
    const { data, error } = await supabase
      .from("fuel_updates")
      .insert([{ ...newFuelUpdate, created_by: user.id }])
      .select()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add fuel update",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setFuelUpdates((prev) => [data[0], ...prev])
    toast({
      title: "Fuel Update Added",
      description: "The fuel update has been successfully added.",
    })
  }

  const handleEditFuelUpdate = async (id: string, updatedFuelUpdate: Partial<FuelUpdate>) => {
    const { data: fuelUpdateData, error: fuelUpdateError } = await supabase
      .from("fuel_updates")
      .select("*")
      .eq("id", id)
      .single()

    if (fuelUpdateError || !fuelUpdateData) {
      toast({
        title: "Error",
        description: "Fuel update not found.",
        variant: "destructive",
      })
      return
    }

    // Fetch the vehicle associated with the fuel update
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", fuelUpdateData.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found.",
        variant: "destructive",
      })
      return
    }

    // Calculate the difference in cost and distance
    const costDifference = (updatedFuelUpdate.cost || 0) - fuelUpdateData.cost
    const distanceDifference = (updatedFuelUpdate.distance || 0) - fuelUpdateData.distance

    // Update the fuel update
    const { data, error } = await supabase
      .from("fuel_updates")
      .update(updatedFuelUpdate)
      .eq("id", id)
      .select()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update fuel update",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total fuel cost and distance
    const updatedVehicle = {
      total_fuel_cost: vehicleData.total_fuel_cost + costDifference,
      total_distance: vehicleData.total_distance + distanceDifference,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setFuelUpdates((prev) => prev.map((update) => (update.id === id ? data[0] : update)))
    setEditingFuelUpdate(null)
    toast({
      title: "Fuel Update Updated",
      description: "The fuel update has been successfully updated.",
    })
  }

  const handleDeleteFuelUpdate = async (id: string) => {
    const { data: fuelUpdateData, error: fuelUpdateError } = await supabase
      .from("fuel_updates")
      .select("*")
      .eq("id", id)
      .single()

    if (fuelUpdateError || !fuelUpdateData) {
      toast({
        title: "Error",
        description: "Fuel update not found.",
        variant: "destructive",
      })
      return
    }

    // Fetch the vehicle associated with the fuel update
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("name", fuelUpdateData.vehicle)
      .single()

    if (vehicleError || !vehicleData) {
      toast({
        title: "Error",
        description: "Vehicle not found.",
        variant: "destructive",
      })
      return
    }

    // Delete the fuel update
    const { error } = await supabase.from("fuel_updates").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete fuel update",
        variant: "destructive",
      })
      return
    }

    // Update the vehicle's total fuel cost and distance
    const updatedVehicle = {
      total_fuel_cost: vehicleData.total_fuel_cost - fuelUpdateData.cost,
      total_distance: vehicleData.total_distance - fuelUpdateData.distance,
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatedVehicle)
      .eq("id", vehicleData.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update vehicle data",
        variant: "destructive",
      })
      return
    }

    // Update the local state
    setFuelUpdates((prev) => prev.filter((update) => update.id !== id))
    toast({
      title: "Fuel Update Deleted",
      description: "The fuel update has been successfully deleted.",
    })
  }

  const AddTicketForm = () => {
    const [newTicket, setNewTicket] = useState({ vehicle: "", issue: "", priority: "Medium", status: "Pending", cost: "" })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate required fields
      if (!newTicket.vehicle || !newTicket.issue || !newTicket.cost) {
        toast({
          title: "Error",
          description: "Please fill out all required fields.",
          variant: "destructive",
        })
        return
      }

      // Call handleAddTicket with the new ticket data
      await handleAddTicket({ ...newTicket, cost: parseFloat(newTicket.cost) })

      // Reset the form
      setNewTicket({ vehicle: "", issue: "", priority: "Medium", status: "Pending", cost: "" })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          value={newTicket.vehicle}
          onValueChange={(value) => setNewTicket({ ...newTicket, vehicle: value })}
        >
          <SelectTrigger className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]">
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.name}>
                {vehicle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Issue Description"
          value={newTicket.issue}
          onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
          className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]"
        />
        <Input
          placeholder="Maintenance Cost"
          type="number"
          value={newTicket.cost}
          onChange={(e) => setNewTicket({ ...newTicket, cost: e.target.value })}
          className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]"
        />
        <Select
          value={newTicket.priority}
          onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
        >
          <SelectTrigger className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full bg-[#ce6d2c] text-[#232323] hover:bg-[#d97d3d]">
          Add Ticket
        </Button>
      </form>
    )
  }

  const FuelUpdateForm = ({ vehicles }: { vehicles: Vehicle[] }) => {
    const [fuelData, setFuelData] = useState({ vehicle: "", fuelAmount: "", distance: "", cost: "" })

    const totalPrice = parseFloat(fuelData.fuelAmount) * parseFloat(fuelData.cost)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate required fields
      if (!fuelData.vehicle || !fuelData.fuelAmount || !fuelData.distance || !fuelData.cost) {
        toast({
          title: "Error",
          description: "Please fill out all required fields.",
          variant: "destructive",
        })
        return
      }

      // Prepare the new fuel update data
      const newFuelUpdate = {
        vehicle: fuelData.vehicle,
        quantity: parseFloat(fuelData.fuelAmount),
        cost: parseFloat(fuelData.cost),
        distance: parseFloat(fuelData.distance),
      }

      // Call handleAddFuelUpdate with the new fuel update data
      await handleAddFuelUpdate(newFuelUpdate)

      // Reset the form
      setFuelData({ vehicle: "", fuelAmount: "", distance: "", cost: "" })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          value={fuelData.vehicle}
          onValueChange={(value) => setFuelData({ ...fuelData, vehicle: value })}
        >
          <SelectTrigger className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]">
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.name}>
                {vehicle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Fuel Amount (liters)"
          type="number"
          value={fuelData.fuelAmount}
          onChange={(e) => setFuelData({ ...fuelData, fuelAmount: e.target.value })}
          className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]"
        />
        <Input
          placeholder="Distance Traveled (km)"
          type="number"
          value={fuelData.distance}
          onChange={(e) => setFuelData({ ...fuelData, distance: e.target.value })}
          className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]"
        />
        <Input
          placeholder="Fuel Cost (per liter)"
          type="number"
          value={fuelData.cost}
          onChange={(e) => setFuelData({ ...fuelData, cost: e.target.value })}
          className="bg-[#333333] border-[#3a3a3a] text-[#c4c4c4]"
        />
        <div className="text-[#c4c4c4]">
          Total Price: ${totalPrice.toFixed(2)}
        </div>
        <Button
          type="submit"
          className="w-full bg-[#ce6d2c] text-[#232323] hover:bg-[#d97d3d]"
        >
          Submit Fuel Update
        </Button>
      </form>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-6 overflow-auto bg-[#2a2a2a] min-h-screen">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md overflow-hidden">
          <Button
            onClick={() => setIsAddMaintenanceOpen(!isAddMaintenanceOpen)}
            className="w-full flex justify-between items-center bg-[#2a2a2a] text-[#ce6d2c] hover:bg-[#333333] p-4"
          >
            Add Maintenance Ticket
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAddMaintenanceOpen ? "transform rotate-180" : ""}`} />
          </Button>
          <div
            className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
              isAddMaintenanceOpen ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className="p-4">
              <AddTicketForm />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md overflow-hidden">
          <Button
            onClick={() => setIsUploadFuelOpen(!isUploadFuelOpen)}
            className="w-full flex justify-between items-center bg-[#2a2a2a] text-[#ce6d2c] hover:bg-[#333333] p-4"
          >
            Add Fuel Update
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUploadFuelOpen ? "transform rotate-180" : ""}`} />
          </Button>
          <div
            className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
              isUploadFuelOpen ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className="p-4">
              <FuelUpdateForm vehicles={vehicles} />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets Table */}
      <Card className="mt-6 bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#ce6d2c]">Ongoing Maintenance Tickets</CardTitle>
          <CardDescription className="text-[#a0a0a0]">View and edit current maintenance tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#ce6d2c]">Vehicle</TableHead>
                <TableHead className="text-[#ce6d2c]">Issue</TableHead>
                <TableHead className="text-[#ce6d2c]">Priority</TableHead>
                <TableHead className="text-[#ce6d2c]">Status</TableHead>
                <TableHead className="text-[#ce6d2c]">Cost</TableHead>
                <TableHead className="text-[#ce6d2c]">Created At</TableHead>
                <TableHead className="text-[#ce6d2c]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-[#333333]">
                  <TableCell className="text-[#a0a0a0]">{ticket.vehicle}</TableCell>
                  <TableCell className="text-[#a0a0a0]">{ticket.issue}</TableCell>
                  <TableCell className="text-[#a0a0a0]">{ticket.priority}</TableCell>
                  <TableCell className="text-[#a0a0a0]">{ticket.status}</TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    ${ticket.cost ? ticket.cost.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {new Date(ticket.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className=" text-white hover:text-dark h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#2a2a2a] border-[#3a3a3a]">
                        <DropdownMenuItem
                          onClick={() => setEditingTicket(ticket.id)}
                          className="text-[#c4c4c4] hover:text-[#ce6d2c] cursor-pointer"
                        >
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fuel Updates Table */}
      <Card className="mt-6 bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#ce6d2c]">Fuel Updates</CardTitle>
          <CardDescription className="text-[#a0a0a0]">View fuel updates for vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#ce6d2c]">Vehicle</TableHead>
                <TableHead className="text-[#ce6d2c]">Quantity (L)</TableHead>
                <TableHead className="text-[#ce6d2c]">Cost ($)</TableHead>
                <TableHead className="text-[#ce6d2c]">Distance (km)</TableHead>
                <TableHead className="text-[#ce6d2c]">Created At</TableHead>
                <TableHead className="text-[#ce6d2c]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelUpdates.map((update) => (
                <TableRow key={update.id} className="hover:bg-[#333333]">
                  <TableCell className="text-[#a0a0a0]">{update.vehicle}</TableCell>
                  <TableCell className="text-[#a0a0a0]">{update.quantity}</TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    ${update.cost ? update.cost.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {update.distance ? update.distance.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {new Date(update.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className=" text-white hover:text-dark h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#2a2a2a] border-[#3a3a3a]">
                        <DropdownMenuItem
                          onClick={() => setEditingFuelUpdate(update.id)}
                          className="text-[#c4c4c4] hover:text-[#ce6d2c] cursor-pointer"
                        >
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFuelUpdate(update.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}

export default MaintenanceComponent