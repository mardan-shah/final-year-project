'use client';
import { useNotification } from '@/contexts/NotificationContext';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotificationComponent = () => {
  const { notifications, markAsRead, removeNotification } = useNotification();

  return (
    <main className="flex-1 p-4 md:p-6 min-h-screen overflow-auto bg-[#1a1a1a]">
      <Card className="mb-6 bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#ce6d2c] text-2xl">Notifications</CardTitle>
          <CardDescription className="text-[#a0a0a0]">
            Stay updated with your fleets latest alerts and information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 flex items-start">
                  {notification.type === "info" && <Info className="h-5 w-5 text-blue-400 mr-4 mt-1" />}
                  {notification.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-400 mr-4 mt-1" />}
                  {notification.type === "success" && <CheckCircle className="h-5 w-5 text-green-400 mr-4 mt-1" />}
                  {notification.type === "error" && <X className="h-5 w-5 text-red-400 mr-4 mt-1" />}
                  <div className="flex-1">
                    <h3 className="text-[#ce6d2c] font-semibold">{notification.title}</h3>
                    <p className="text-[#a0a0a0] mt-1">{notification.message}</p>
                    <p className="text-[#808080] text-sm mt-2">{new Date(notification.id).toLocaleTimeString()}</p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="outline" 
                      className="ml-4 bg-[#3a3a3a] text-[#c4c4c4] hover:bg-[#4a4a4a] hover:text-[#ce6d2c]"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="ml-4 bg-[#3a3a3a] text-[#c4c4c4] hover:bg-[#4a4a4a] hover:text-[#ce6d2c]"
                    onClick={() => removeNotification(notification.id)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default NotificationComponent;