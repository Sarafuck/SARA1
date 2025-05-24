import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Search,
  Crown,
  Check,
  X,
  MessageCircle,
  UserCheck
} from "lucide-react";

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // ดึงรายชื่อเพื่อน
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
  });

  // ดึงคำขอเป็นเพื่อน
  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/friend-requests'],
  });

  // การส่งคำขอเป็นเพื่อน
  const sendRequestMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', '/api/friend-requests', { 
        requestedId: userId 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ส่งคำขอแล้ว",
        description: "ส่งคำขอเป็นเพื่อนเรียบร้อยแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำขอได้",
        variant: "destructive",
      });
    },
  });

  // การตอบรับ/ปฏิเสธคำขอ
  const respondRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/friend-requests/${id}`, { 
        status 
      });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'accepted' ? "ตอบรับแล้ว" : "ปฏิเสธแล้ว",
        description: status === 'accepted' 
          ? "เพิ่มเพื่อนใหม่เรียบร้อยแล้ว" 
          : "ปฏิเสธคำขอเป็นเพื่อนแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถตอบกลับได้",
        variant: "destructive",
      });
    },
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-gray-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-emerald-500";
      case 4: return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const filteredFriends = friends.filter((friend: any) =>
    friend.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">เพื่อน</h1>
        <p className="text-gray-600 mt-1">จัดการเพื่อนและคำขอเป็นเพื่อน</p>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>เพื่อน ({friends.length})</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>คำขอ ({friendRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ค้นหาเพื่อน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อเพื่อน</CardTitle>
            </CardHeader>
            <CardContent>
              {friendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? "ไม่พบเพื่อนที่ค้นหา" : "ยังไม่มีเพื่อน"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {!searchQuery && "เริ่มเพิ่มเพื่อนใหม่ได้เลย"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map((friend: any) => (
                    <div
                      key={friend.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {friend.firstName?.[0] || friend.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {friend.firstName 
                              ? `${friend.firstName} ${friend.lastName || ''}` 
                              : 'ผู้ใช้'
                            }
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${getLevelColor(friend.level)} text-white text-xs`}>
                              <Crown className="w-3 h-3 mr-1" />
                              LV.{friend.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              XP: {friend.xp}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 flex items-center space-x-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>แชท</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>คำขอเป็นเพื่อน</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : friendRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่มีคำขอเป็นเพื่อน</p>
                  <p className="text-sm text-gray-400">
                    คำขอเป็นเพื่อนใหม่จะปรากฏที่นี่
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.requester.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {request.requester.firstName?.[0] || request.requester.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.requester.firstName 
                                ? `${request.requester.firstName} ${request.requester.lastName || ''}` 
                                : 'ผู้ใช้'
                              }
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getLevelColor(request.requester.level)} text-white text-xs`}>
                                <Crown className="w-3 h-3 mr-1" />
                                LV.{request.requester.level}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                XP: {request.requester.xp}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => respondRequestMutation.mutate({ 
                              id: request.id, 
                              status: 'accepted' 
                            })}
                            disabled={respondRequestMutation.isPending}
                            className="flex items-center space-x-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>ตอบรับ</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondRequestMutation.mutate({ 
                              id: request.id, 
                              status: 'rejected' 
                            })}
                            disabled={respondRequestMutation.isPending}
                            className="flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>ปฏิเสธ</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}