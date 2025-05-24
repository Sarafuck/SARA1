import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import CreatePost from "@/components/post/create-post";
import PostCard from "@/components/post/post-card";
import LendingCard from "@/components/lending/lending-card";
import FraudCheck from "@/components/fraud/fraud-check";
import ThemeShop from "@/components/shop/theme-shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Star,
  Heart,
  MessageCircle,
  UserPlus
} from "lucide-react";
import type { PostWithUser, UserWithStats } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'feed' | 'lending' | 'friends' | 'fraud' | 'chat' | 'shop'>('feed');

  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: ['/api/posts'],
    enabled: !!user,
  });

  const { data: userStats } = useQuery<UserWithStats>({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['/api/friends'],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  if (!user || !userStats) {
    return <div>Loading...</div>;
  }

  // Calculate XP progress for next level
  const getXPProgress = () => {
    const level = userStats.level;
    const xp = userStats.xp;
    
    const levelThresholds = { 1: 500, 2: 1500, 3: 3000, 4: Infinity };
    const currentThreshold = levelThresholds[level as keyof typeof levelThresholds];
    const previousThreshold = level === 1 ? 0 : levelThresholds[(level - 1) as keyof typeof levelThresholds];
    
    if (currentThreshold === Infinity) return 100;
    
    const progress = ((xp - previousThreshold) / (currentThreshold - previousThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getNextLevelXP = () => {
    const level = userStats.level;
    const levelThresholds = { 1: 500, 2: 1500, 3: 3000, 4: Infinity };
    return levelThresholds[level as keyof typeof levelThresholds];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar user={userStats} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-2">
                สวัสดี {userStats.firstName || 'คุณ'}! 👋
              </h2>
              <p className="text-indigo-100 mb-4">
                ระดับของคุณ: <span className="font-semibold">Level {userStats.level}</span> | 
                วงเงินกู้สูงสุด: <span className="font-semibold">฿{(userStats.level * 10000).toLocaleString()}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedTab('feed')}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  โพสต์ใหม่
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTab('lending')}
                  className="border-white text-white hover:bg-white hover:text-indigo-600"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  ขอกู้เงิน
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-lg border-0 text-white">
              <CardHeader>
                <CardTitle className="text-lg">สถิติของคุณ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-indigo-100">คืนเงินตรงเวลา</span>
                  <span className="font-semibold">{userStats.onTimePayments}/{userStats.totalPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">โพสต์ทั้งหมด</span>
                  <span className="font-semibold">{userStats.posts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">เพื่อน</span>
                  <span className="font-semibold">{friends.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={userStats.profileImageUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {userStats.firstName?.[0] || userStats.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {userStats.firstName ? `${userStats.firstName} ${userStats.lastName || ''}` : 'ผู้ใช้'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    สมาชิกตั้งแต่ {new Date(userStats.createdAt).toLocaleDateString('th-TH')}
                  </p>
                  
                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Level {userStats.level}</span>
                      <span className="text-sm text-gray-500">{Math.round(getXPProgress())}%</span>
                    </div>
                    <Progress value={getXPProgress()} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {getNextLevelXP() === Infinity 
                        ? 'ระดับสูงสุดแล้ว!' 
                        : `อีก ${getNextLevelXP() - userStats.xp} XP ถึง Level ${userStats.level + 1}`
                      }
                    </p>
                  </div>

                  {/* XP Badge */}
                  <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    {userStats.xp.toLocaleString()} XP
                  </Badge>
                </CardContent>
              </Card>

              {/* Navigation Tabs */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedTab === 'feed' ? 'default' : 'ghost'}
                      onClick={() => setSelectedTab('feed')}
                      className="justify-start"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      ฟีด
                    </Button>
                    <Button
                      variant={selectedTab === 'lending' ? 'default' : 'ghost'}
                      onClick={() => setSelectedTab('lending')}
                      className="justify-start"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      กู้เงิน
                    </Button>
                    <Button
                      variant={selectedTab === 'friends' ? 'default' : 'ghost'}
                      onClick={() => setSelectedTab('friends')}
                      className="justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      เพื่อน
                    </Button>
                    <Button
                      variant={selectedTab === 'fraud' ? 'default' : 'ghost'}
                      onClick={() => setSelectedTab('fraud')}
                      className="justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      เช็คโกง
                    </Button>
                    <Button
                      variant={selectedTab === 'shop' ? 'default' : 'ghost'}
                      onClick={() => setSelectedTab('shop')}
                      className="justify-start"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      ร้านค้า
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {selectedTab === 'feed' && (
                <>
                  <CreatePost />
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="w-32 h-4 bg-gray-300 rounded"></div>
                                <div className="w-20 h-3 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-4 bg-gray-300 rounded"></div>
                              <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard key={post.id} post={post} currentUser={userStats} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีโพสต์</h3>
                        <p className="text-gray-600 mb-4">เป็นคนแรกที่แบ่งปันเรื่องราวในชุมชน!</p>
                        <Button>สร้างโพสต์แรก</Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {selectedTab === 'lending' && <LendingCard userStats={userStats} />}

              {selectedTab === 'friends' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      เพื่อนของคุณ ({friends.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {friends.length > 0 ? (
                      <div className="space-y-4">
                        {friends.map((friend: any) => (
                          <div key={friend.id} className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={friend.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {friend.firstName?.[0] || friend.email?.[0] || 'F'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {friend.firstName ? `${friend.firstName} ${friend.lastName || ''}` : 'เพื่อน'}
                              </p>
                              <p className="text-sm text-gray-500">Level {friend.level}</p>
                            </div>
                            <Badge variant="outline">Level {friend.level}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีเพื่อน</h3>
                        <p className="text-gray-600 mb-4">เริ่มต้นสร้างเครือข่ายของคุณกันเถอะ!</p>
                        <Button>ค้นหาเพื่อน</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedTab === 'fraud' && <FraudCheck />}
{selectedTab === 'shop' && <ThemeShop userStats={userStats} />}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Lending Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">สถานะการเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="text-sm opacity-90">วงเงินคงเหลือ</div>
                    <div className="text-2xl font-bold">
                      ฿{userStats.availableCredit?.toLocaleString() || '0'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-4 text-white">
                    <div className="text-sm opacity-90">หนี้คงค้าง</div>
                    <div className="text-xl font-bold">
                      ฿{userStats.outstandingDebt?.toLocaleString() || '0'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">อัตราดอกเบี้ยของคุณ</div>
                    <div className="text-lg font-bold text-primary">
                      {userStats.interestRate}%
                    </div>
                    <div className="text-xs text-gray-500">สำหรับ Level {userStats.level}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Online Friends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">เพื่อนออนไลน์</CardTitle>
                </CardHeader>
                <CardContent>
                  {friends.slice(0, 5).map((friend: any) => (
                    <div key={friend.id} className="flex items-center space-x-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friend.profileImageUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {friend.firstName?.[0] || 'F'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {friend.firstName || 'เพื่อน'}
                        </div>
                        <div className="text-xs text-emerald-600">Level {friend.level}</div>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      ยังไม่มีเพื่อนออนไลน์
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">การแจ้งเตือนล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification: any) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        ไม่มีการแจ้งเตือนใหม่
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
