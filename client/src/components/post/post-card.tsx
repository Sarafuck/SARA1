import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  ThumbsDown, 
  MoreHorizontal,
  Crown,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PostWithUser, UserWithStats } from "@shared/schema";

interface PostCardProps {
  post: PostWithUser;
  currentUser: UserWithStats;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.userReaction?.type === 'like');
  const [isDisliked, setIsDisliked] = useState(post.userReaction?.type === 'dislike');
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);

  const reactMutation = useMutation({
    mutationFn: async (type: 'like' | 'dislike') => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/react`, { type });
      return response.json();
    },
    onSuccess: (data, type) => {
      const wasAlreadyReacted = (type === 'like' && isLiked) || (type === 'dislike' && isDisliked);
      
      if (type === 'like') {
        if (wasAlreadyReacted) {
          setIsLiked(false);
          setLikes(prev => prev - 1);
        } else {
          setIsLiked(true);
          setIsDisliked(false);
          setLikes(prev => prev + 1);
          if (isDisliked) setDislikes(prev => prev - 1);
          
          toast({
            title: "ไลค์แล้ว!",
            description: `คุณใช้ 1 XP ${post.userId !== currentUser.id ? 'และเจ้าของโพสต์ได้รับ 1 XP' : ''}`,
          });
        }
      } else {
        if (wasAlreadyReacted) {
          setIsDisliked(false);
          setDislikes(prev => prev - 1);
        } else {
          setIsDisliked(true);
          setIsLiked(false);
          setDislikes(prev => prev + 1);
          if (isLiked) setLikes(prev => prev - 1);
          
          toast({
            title: "ดิสไลค์แล้ว",
            description: `คุณใช้ 2 XP ${post.userId !== currentUser.id ? 'และเจ้าของโพสต์เสีย 5 XP' : ''}`,
            variant: "destructive",
          });
        }
      }
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตอบสนองโพสต์ได้",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/posts/${post.id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ลบโพสต์แล้ว",
        description: "โพสต์ของคุณถูกลบเรียบร้อยแล้ว",
      });
      // บังคับรีเฟรชข้อมูลโพสต์
      queryClient.removeQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบโพสต์ได้",
        variant: "destructive",
      });
    },
  });

  const handleReaction = (type: 'like' | 'dislike') => {
    if (currentUser.xp < (type === 'like' ? 1 : 2)) {
      toast({
        title: "XP ไม่เพียงพอ",
        description: `คุณต้องมี XP อย่างน้อย ${type === 'like' ? 1 : 2} เพื่อ${type === 'like' ? 'ไลค์' : 'ดิสไลค์'}`,
        variant: "destructive",
      });
      return;
    }
    
    reactMutation.mutate(type);
  };

  const handleDelete = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?')) {
      deleteMutation.mutate();
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-gray-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-emerald-500";
      case 4: return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "เมื่อสักครู่";
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return postDate.toLocaleDateString('th-TH');
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage src={post.user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.user.firstName?.[0] || post.user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {post.user.firstName ? `${post.user.firstName} ${post.user.lastName || ''}` : 'ผู้ใช้'}
                </h4>
                <Badge className={`${getLevelColor(post.user.level)} text-white text-xs px-2 py-1`}>
                  <Crown className="w-3 h-3 mr-1" />
                  LV.{post.user.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Post Actions */}
          {(post.userId === currentUser.id || currentUser.isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.userId === currentUser.id && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบโพสต์
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="mt-3 rounded-lg w-full max-h-96 object-cover"
            />
          )}
        </div>
        
        {/* Post Engagement */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              disabled={reactMutation.isPending}
              className={`flex items-center space-x-2 ${
                isLiked 
                  ? "text-red-600 hover:text-red-700" 
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
              <span className="text-xs text-gray-400">(-1 XP)</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              disabled={reactMutation.isPending}
              className={`flex items-center space-x-2 ${
                isDisliked 
                  ? "text-red-600 hover:text-red-700" 
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
              <span>{dislikes}</span>
              <span className="text-xs text-gray-400">(-2 XP)</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            XP: <span className={`font-medium ${post.xpGained >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {post.xpGained > 0 ? '+' : ''}{post.xpGained}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
