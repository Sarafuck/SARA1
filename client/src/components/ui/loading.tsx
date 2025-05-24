
import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
