import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserWithStats } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = () => {
    // ลบข้อมูลผู้ใช้จาก cache และเปลี่ยนเส้นทางไปหน้า login
    queryClient.clear();
    window.location.href = "/api/logout";
  };

  return {
    user: user as UserWithStats | undefined,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
