import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";

export default function Logout() {
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await fine.auth.signOut();
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    handleLogout();
  }, [toast]);

  return <Navigate to="/" />;
}