'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CreditCard, Bell, Shield, Truck, Users, Wrench, Fuel, MapPin, BarChart } from 'lucide-react'
import Link from 'next/link'

const SettingsComponent = () => {
  const [notifications, setNotifications] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  return (
    <div className="container min-h-screen mx-auto p-6 bg-dark text-gray-light">
      <h1 className="text-3xl font-bold text-primaryaccent mb-6">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-hover border-dark">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primaryaccent data-[state=active]:text-dark">Profile</TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-primaryaccent data-[state=active]:text-dark">Account</TabsTrigger>
          <TabsTrigger value="fleet" className="data-[state=active]:bg-primaryaccent data-[state=active]:text-dark">Fleet Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-dark border-dark">
            <CardHeader>
              <CardTitle className="text-primaryaccent text-2xl">Profile Settings</CardTitle>
              <CardDescription className="text-gray-muted">Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-light">Name</Label>
                <Input id="name" placeholder="John Doe" className="bg-hover border-dark text-gray-light" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-light">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-hover border-dark text-gray-light" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-light">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="bg-hover border-dark text-gray-light" />
              </div>
              <Button asChild className="w-full bg-primaryaccent text-dark hover:bg-[#d97d3d]">
                <Link href="/save-changes">Save Changes</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="bg-dark border-dark">
            <CardHeader>
              <CardTitle className="text-primaryaccent text-2xl">Account Settings</CardTitle>
              <CardDescription className="text-gray-muted">Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-gray-light">Notifications</Label>
                  <p className="text-sm text-gray-muted">Receive email notifications</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className="bg-hover"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing" className="text-gray-light">Data Sharing</Label>
                  <p className="text-sm text-gray-muted">Share anonymous usage data</p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={dataSharing}
                  onCheckedChange={setDataSharing}
                  className="bg-hover"
                />
              </div>
              <Button asChild className="w-full bg-primaryaccent text-dark hover:bg-[#d97d3d]">
                <Link href="/update-password">Update Password</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Vehicle Management", icon: Truck, href: "/settings/vehicles" },
              { title: "Driver Management", icon: Users, href: "/settings/drivers" },
              { title: "Maintenance Schedules", icon: Wrench, href: "/settings/maintenance" },
              { title: "Fuel Management", icon: Fuel, href: "/settings/fuel" },
              { title: "Route Optimization", icon: MapPin, href: "/settings/routes" },
              { title: "Reporting & Analytics", icon: BarChart, href: "/settings/analytics" },
            ].map((item, index) => (
              <Card key={index} className="bg-dark border-dark">
                <CardHeader>
                  <CardTitle className="text-primaryaccent flex items-center text-xl">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-primaryaccent text-dark hover:bg-[#d97d3d]">
                    <Link href={item.href}>Configure</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsComponent

