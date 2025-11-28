"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Users, MessageSquare } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { useChat } from "@/hooks/use-chat"

export default function TeamPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { conversations } = useChat()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const teamMembers = conversations.map((conv) => ({
    id: conv.other_user_id,
    username: conv.other_user_username,
    unread_count: conv.unread_count,
  }))

  return (
    <AppLayout title="Team">
      <div className="space-y-6">
        {/* Current User Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card bg-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="default">Online</Badge>
                    <Badge variant="outline">{user?.role}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members from Conversations */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">People You've Chatted With</h2>
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No conversations yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Start a conversation to see team members here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{member.username}</h3>
                          {member.unread_count > 0 && (
                            <Badge variant="secondary" className="mt-1">
                              {member.unread_count} unread
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 w-full bg-transparent"
                        size="sm"
                        onClick={() => router.push("/chat")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
