import { Film, LayoutDashboard, Heart, Clock, CreditCard, User as UserIcon, LogOut, Shield, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export type DashSection = "overview" | "continue" | "favorites" | "history" | "payments" | "profile";

const ITEMS: { id: DashSection; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "continue", label: "Continue Watching", icon: Clock },
  { id: "favorites", label: "My Favorites", icon: Heart },
  { id: "history", label: "Watch History", icon: Clock },
  { id: "payments", label: "Subscription & Pay", icon: CreditCard },
  { id: "profile", label: "Profile", icon: UserIcon },
];

export function DashboardSidebar({
  section,
  onSelect,
  isAdmin,
  email,
}: {
  section: DashSection;
  onSelect: (s: DashSection) => void;
  isAdmin: boolean;
  email?: string;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const nav = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-gradient-gold grid place-items-center text-black shrink-0">
            <Film className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display font-bold text-sm leading-tight">VJ STREAM <span className="text-gold">UG</span></div>
              <div className="text-[10px] text-muted-foreground truncate">{email}</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((it) => (
                <SidebarMenuItem key={it.id}>
                  <SidebarMenuButton
                    isActive={section === it.id}
                    onClick={() => onSelect(it.id)}
                    tooltip={it.label}
                    className={section === it.id ? "bg-gradient-gold !text-black font-semibold" : ""}
                  >
                    <it.icon className="w-4 h-4" />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link to="/admin" className="text-gold">
                      <Shield className="w-4 h-4" />
                      <span>Control Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link to="/"><ChevronLeft className="w-4 h-4" /><span>Back to site</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign out">
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
