import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutSectionProps {
  title: string;
  logoutLabel: string;
}

export function LogoutSection({ title, logoutLabel }: LogoutSectionProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("appointment_date");
    router.replace("/login");
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
        {title}
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex items-center gap-3 text-[#963838] hover:bg-[#FDF2F2] transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-[#F8EEEE] flex items-center justify-center">
          <LogOut size={16} />
        </div>
        <span className="text-xs font-bold">{logoutLabel}</span>
      </button>
    </div>
  );
}