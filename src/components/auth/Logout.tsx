"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // adjust to your setup

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/auth/login");
      router.refresh();
    } else {
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="iinline-flex items-center justify-center gap-2 text-white font-sans font-medium py-3 px-6 rounded-xl hover:opacity-90 transition text-sm"
      style={{ backgroundColor: "#8B6F4E" }}
    >
      Logout
    </button>
  );
}
