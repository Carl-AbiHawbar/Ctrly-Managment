import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutItem() {
  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
    window.location.href = "/login";
  }

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  );
}
