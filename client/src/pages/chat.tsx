import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  Users,
  Crown
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ดึงห้องแชท
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat/rooms'],
  });

  // ดึงข้อความในห้องที่เลือก
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', selectedRoom],
    enabled: !!selectedRoom,
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    
    // TODO: ส่งข้อความผ่าน API
    console.log('Sending message:', message);
    setMessage("");
  };

  const filteredRooms = chatRooms.filter((room: any) =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">แชท</h2>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>ใหม่</span>
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ค้นหาแชท..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1">
          {roomsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีห้องแชท</p>
              <p className="text-sm text-gray-400">เริ่มสนทนาใหม่ได้เลย</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredRooms.map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom === room.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={room.participants?.[0]?.user?.profileImageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {room.isGroup ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            room.participants?.[0]?.user?.firstName?.[0] || 'U'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {room.isGroup && (
                        <Badge className="absolute -bottom-1 -right-1 text-xs px-1">
                          {room.participants?.length || 0}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {room.name || 'แชทส่วนตัว'}
                        </h3>
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    <Users className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">ห้องแชท</h3>
                  <p className="text-sm text-gray-500">
                    {messages.length} ข้อความ
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีข้อความ</p>
                    <p className="text-sm text-gray-400">เริ่มสนทนากันเลย</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.userId === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-sm px-4 py-2 rounded-lg ${
                          msg.userId === user?.id
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.userId !== user?.id && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">
                              {msg.user?.firstName || 'ผู้ใช้'}
                            </span>
                            <Badge className={`${getLevelColor(msg.user?.level || 1)} text-white text-xs`}>
                              <Crown className="w-2 h-2 mr-1" />
                              {msg.user?.level || 1}
                            </Badge>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.userId === user?.id ? "text-white/70" : "text-gray-500"
                        }`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="พิมพ์ข้อความ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                เลือกห้องแชท
              </h3>
              <p className="text-gray-500">
                เลือกห้องแชทจากด้านซ้ายเพื่อเริ่มสนทนา
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}