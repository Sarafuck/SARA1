import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, MessageCircle, Users, Plus } from "lucide-react";
import type { ChatRoomWithParticipants, ChatMessageWithUser, User } from "@shared/schema";

interface ChatBoxProps {
  currentUser: User;
}

export default function ChatBox({ currentUser }: ChatBoxProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ดึงรายการห้องแชท
  const { data: chatRooms = [] } = useQuery<ChatRoomWithParticipants[]>({
    queryKey: ['/api/chat/rooms'],
  });

  // ดึงข้อความในห้องที่เลือก
  const { data: messages = [] } = useQuery<ChatMessageWithUser[]>({
    queryKey: ['/api/chat/messages', selectedRoom],
    enabled: !!selectedRoom,
  });

  // ส่งข้อความ
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { roomId: number; content: string }) => {
      const response = await apiRequest('POST', '/api/chat/messages', data);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedRoom] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งข้อความได้",
        variant: "destructive",
      });
    },
  });

  // เลื่อนไปข้อความล่าสุด
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    sendMessageMutation.mutate({
      roomId: selectedRoom,
      content: newMessage
    });
  };

  const selectedRoomData = chatRooms.find(room => room.id === selectedRoom);

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      {/* รายการห้องแชท */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">ห้องแชท</h3>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {chatRooms.map((room) => (
              <Card 
                key={room.id} 
                className={`cursor-pointer transition-colors hover:bg-gray-100 ${
                  selectedRoom === room.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRoom(room.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{room.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {room.participants.length} คน
                      </div>
                      {room.lastMessage && (
                        <div className="text-xs text-gray-400 truncate">
                          {room.lastMessage.content}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* พื้นที่แชท */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* หัวข้อห้องแชท */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedRoomData?.name}</h3>
                  <div className="text-sm text-gray-500">
                    {selectedRoomData?.participants.length} สมาชิก
                  </div>
                </div>
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  ออนไลน์
                </Badge>
              </div>
            </div>

            {/* ข้อความ */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex items-start space-x-3 ${
                      message.userId === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.user.profileImageUrl} />
                      <AvatarFallback>
                        {message.user.firstName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${
                      message.userId === currentUser.id ? 'items-end' : 'items-start'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {message.user.firstName} {message.user.lastName}
                      </div>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        message.userId === currentUser.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-gray-100'
                      }`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString('th')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* พิมพ์ข้อความ */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // ไม่ได้เลือกห้อง
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                เลือกห้องแชท
              </h3>
              <p className="text-gray-500">
                เลือกห้องแชทจากด้านซ้ายเพื่อเริ่มการสนทนา
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}