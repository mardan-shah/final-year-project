'use client'
import { useState, useEffect } from "react"
import { ChevronDown, DollarSign, Package, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import FuelConsumptionChart from "@/components/dashboard/FuelConsumptionChart"
import MaintenanceCostsChart from "@/components/dashboard/MaintenanceCostsChart"
import VehicleUtilizationChart from "@/components/dashboard/VehicleUtilizationChart"
import { supabase } from "@/supabase"

const Dashboard = () => {
  const [useDummyData, setUseDummyData] = useState(false)
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    newThisMonth: 0,
  })
  const [driverStats, setDriverStats] = useState({
    total: 0,
    newThisMonth: 0,
  })
  const [distanceStats, setDistanceStats] = useState({
    total: 0,
    growthPercentage: 0,
  })
  const [fuelStats, setFuelStats] = useState({
    total: 0,
    growthPercentage: 0,
  })
  const [fuelConsumptionData, setFuelConsumptionData] = useState([])
  const [maintenanceCostsData, setMaintenanceCostsData] = useState([])
  const [vehicleUtilizationData, setVehicleUtilizationData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Dummy data
  const dummyData = {
    vehicleStats: {
      total: 45,
      newThisMonth: 2,
    },
    driverStats: {
      total: 32,
      newThisMonth: 3,
    },
    distanceStats: {
      total: 28345,
      growthPercentage: 14,
    },
    fuelStats: {
      total: 12789,
      growthPercentage: 2.5,
    },
    fuelConsumption: [
      { month: "Jan", consumption: 5000 },
      { month: "Feb", consumption: 4800 },
      { month: "Mar", consumption: 5200 },
      { month: "Apr", consumption: 5100 },
      { month: "May", consumption: 4900 },
      { month: "Jun", consumption: 5300 },
    ],
    maintenanceCosts: [
      { month: "Jan", cost: 2000 },
      { month: "Feb", cost: 2200 },
      { month: "Mar", cost: 1800 },
      { month: "Apr", cost: 2100 },
      { month: "May", cost: 2300 },
      { month: "Jun", cost: 2000 },
    ],
    vehicleUtilization: [
      { vehicle: "Truck 1", utilization: 85 },
      { vehicle: "Truck 2", utilization: 72 },
      { vehicle: "Van 1", utilization: 90 },
      { vehicle: "Van 2", utilization: 68 },
      { vehicle: "Car 1", utilization: 95 },
    ],
    recentActivity: [
      { id: 1, created_at: "2023-10-01", vehicle: "Truck 1", distance: 150, cost: 200 },
      { id: 2, created_at: "2023-10-02", vehicle: "Van 1", distance: 120, cost: 180 },
    ],
  }

  useEffect(() => {
    if (!useDummyData) {
      fetchDashboardData()
    } else {
      setDefaultDummyData()
    }
  }, [useDummyData])

  const setDefaultDummyData = () => {
    setVehicleStats(dummyData.vehicleStats)
    setDriverStats(dummyData.driverStats)
    setDistanceStats(dummyData.distanceStats)
    setFuelStats(dummyData.fuelStats)
    setFuelConsumptionData(dummyData.fuelConsumption)
    setMaintenanceCostsData(dummyData.maintenanceCosts)
    setVehicleUtilizationData(dummyData.vehicleUtilization)
    setRecentActivity(dummyData.recentActivity)
  }

  const fetchDashboardData = async () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
    // Fetch vehicles data
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*');
  
    const newVehiclesThisMonth = vehicles?.filter(vehicle =>
      new Date(vehicle.created_at) >= firstDayOfMonth
    ).length || 0;
  
    // Fetch drivers data
    const { data: drivers } = await supabase
      .from('drivers')
      .select('*');
  
    const newDriversThisMonth = drivers?.filter(driver =>
      new Date(driver.created_at) >= firstDayOfMonth
    ).length || 0;
  
    // Calculate total distance and fuel costs
    const totalDistance = vehicles?.reduce((sum, vehicle) => sum + (parseFloat(vehicle.total_distance) || 0), 0) || 0;
    const totalFuelCost = vehicles?.reduce((sum, vehicle) => sum + (parseFloat(vehicle.total_fuel_cost) || 0), 0) || 0;
  
    // Update stats
    setVehicleStats({
      total: vehicles?.length || 0,
      newThisMonth: newVehiclesThisMonth,
    });
  
    setDriverStats({
      total: drivers?.length || 0,
      newThisMonth: newDriversThisMonth,
    });
  
    setDistanceStats({
      total: totalDistance,
      growthPercentage: 14, // You would calculate this based on historical data
    });
  
    setFuelStats({
      total: totalFuelCost,
      growthPercentage: 2.5, // You would calculate this based on historical data
    });
  
    // Fetch fuel updates and calculate monthly fuel consumption data
    const { data: fuelUpdates } = await supabase
      .from('fuel_updates')
      .select('*');
  
    const monthlyFuelData = calculateMonthlyData(fuelUpdates, 'quantity');
    setFuelConsumptionData(monthlyFuelData);
  
    // Fetch maintenance tickets and calculate monthly maintenance costs
    const { data: maintenanceTickets } = await supabase
      .from('tickets')
      .select('*');
  
    const monthlyMaintenanceData = calculateMonthlyData(maintenanceTickets, 'cost');
    setMaintenanceCostsData(monthlyMaintenanceData);
  
    // Calculate vehicle utilization
    const utilizationData = vehicles?.map(vehicle => ({
      vehicle: vehicle.name,
      utilization: calculateVehicleUtilization(vehicle, fuelUpdates),
    })) || [];
    setVehicleUtilizationData(utilizationData);
  
    // Fetch recent activity
    const { data: recentFuelUpdates } = await supabase
      .from('fuel_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
  
    setRecentActivity(recentFuelUpdates || []);
  };

  const calculateMonthlyData = (data, field) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData = months.map(month => ({
      month,
      [field === 'quantity' ? 'consumption' : field]: 0
    }))

    data?.forEach(item => {
      const date = new Date(item.created_at)
      const monthIndex = date.getMonth()
      monthlyData[monthIndex][field === 'quantity' ? 'consumption' : field] += item[field] || 0
    })

    return monthlyData
  }

  const calculateVehicleUtilization = (vehicle, fuelUpdates) => {
    if (!fuelUpdates || !vehicle) return 0; // Handle missing data
  
    // Filter fuel updates for the specific vehicle
    const vehicleUpdates = fuelUpdates.filter(update => update.vehicle_id === vehicle.id); // Use the correct field (e.g., vehicle_id)
  
    // Count unique days with activity
    const daysWithActivity = new Set(
      vehicleUpdates.map(update => new Date(update.created_at).toDateString())
    ).size;
  
    const totalDays = 30; // Assuming last 30 days
    return (daysWithActivity / totalDays) * 100; // Return utilization percentage
  };

  return (
    <main className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Switch
          id="data-mode"
          checked={useDummyData}
          onCheckedChange={setUseDummyData}
        />
        <label htmlFor="data-mode" className="text-sm font-medium text-gray-light">
          Use Dummy Data
        </label>
      </div>

      <div className="grid gap-4 mb-6 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-dark border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-light">Total Vehicles</CardTitle>
            <Package className="h-4 w-4 text-primaryaccent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primaryaccent">{vehicleStats.total}</div>
            <p className="text-xs text-gray-muted">+{vehicleStats.newThisMonth} from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-light">Active Drivers</CardTitle>
            <User className="h-4 w-4 text-primaryaccent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primaryaccent">{driverStats.total}</div>
            <p className="text-xs text-gray-muted">+{driverStats.newThisMonth} from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-dark border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-light">Total Distance</CardTitle>
            <ChevronDown className="h-4 w-4 text-primaryaccent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primaryaccent">
              {typeof distanceStats.total === 'number' ? distanceStats.total.toFixed(0) : 0} km
            </div>
            <p className="text-xs text-gray-muted">+{distanceStats.growthPercentage}% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-dark border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-light">Fuel Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-primaryaccent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primaryaccent">
              ${typeof fuelStats.total === 'number' ? fuelStats.total.toFixed(2) : 0}
            </div>
            <p className="text-xs text-gray-muted">+{fuelStats.growthPercentage}% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <FuelConsumptionChart data={useDummyData ? dummyData.fuelConsumption : fuelConsumptionData} />
        <MaintenanceCostsChart data={useDummyData ? dummyData.maintenanceCosts : maintenanceCostsData} />
      </div>

      <VehicleUtilizationChart data={useDummyData ? dummyData.vehicleUtilization : vehicleUtilizationData} />

      <Card className="mb-6 bg-dark border-dark-border">
        <CardHeader>
          <CardTitle className="text-primaryaccent">Recent Activity</CardTitle>
          <CardDescription className="text-gray-muted">Latest activities related to vehicle usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primaryaccent">Date</TableHead>
                <TableHead className="text-primaryaccent">Vehicle</TableHead>
                <TableHead className="text-primaryaccent">Distance</TableHead>
                <TableHead className="text-primaryaccent">Fuel Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(useDummyData ? dummyData.recentActivity : recentActivity).map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="text-gray-muted">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-muted">{activity.vehicle}</TableCell>
                  <TableCell className="text-gray-muted">{activity.distance} km</TableCell>
                  <TableCell className="text-gray-muted">${activity.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}

export default Dashboard