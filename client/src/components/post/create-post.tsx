import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ImageIcon, 
  VideoIcon, 
  SmileIcon,
  Zap
} from "lucide-react";

export default function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setIsExpanded(false);
      toast({
        title: "โพสต์สำเร็จ!",
        description: "โพสต์ของคุณถูกเผยแพร่แล้ว คุณใช้ 5 XP",
      });
      // Refresh posts and user data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างโพสต์ได้",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "กรุณาใส่เนื้อหา",
        description: "โพสต์ต้องมีเนื้อหาก่อนเผยแพร่",
        variant: "destructive",
      });
      return;
    }

    if (!user || user.xp < 5) {
      toast({
        title: "XP ไม่เพียงพอ",
        description: "คุณต้องมี XP อย่างน้อย 5 เพื่อสร้างโพสต์",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ content: content.trim() });
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  if (!user) return null;

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12 border-2 border-gray-100">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user.firstName?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="แบ่งปันความคิดของคุณ... (ใช้ 5 XP)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleTextareaFocus}
              className="border-none resize-none bg-gray-50 focus:bg-white transition-colors min-h-[80px] text-base placeholder:text-gray-500"
              maxLength={1000}
            />
            
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Character count */}
                <div className="text-right">
                  <span className={`text-sm ${content.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                    {content.length}/1000
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <Button variant="ghost" size="sm" disabled>
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <VideoIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <SmileIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>ใช้ 5 XP</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">
                        คงเหลือ {Math.max(0, (user.xp || 0) - 5).toLocaleString()} XP
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={createPostMutation.isPending || !content.trim() || (user.xp || 0) < 5}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                    >
                      {createPostMutation.isPending ? "กำลังโพสต์..." : "โพสต์"}
                    </Button>
                  </div>
                </div>

                {/* XP Warning */}
                {(user.xp || 0) < 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <Zap className="w-4 h-4" />
                      <span>คุณมี XP ไม่เพียงพอในการสร้างโพสต์ (ต้องการ 5 XP)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
