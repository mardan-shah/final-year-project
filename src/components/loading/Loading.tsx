'use client'

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const Loading =()=> {
  return (
    <div className="flex items-center justify-center h-screen bg-[#232323]">
      <Card className="bg-[#2a2a2a] border-[#3a3a3a] w-64">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 text-[#ce6d2c] animate-spin" />
          <p className="mt-4 text-[#c4c4c4] text-sm">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Loading;