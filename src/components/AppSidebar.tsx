import {
  Calculator,
  FileText,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  LogOut,
  User as UserIcon,
  Menu,
  ShieldCheck,
  TrendingUp,
  Moon,
  Sun,
  Bot,
  Clock
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "GST Calculator",
    url: "/calculator",
    icon: Calculator,
  },
  {
    title: "Invoice Studio",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Late Fee Calc",
    url: "/late-fee",
    icon: Clock,
  },
  {
    title: "Tax AI Chat",
    url: "/ai-chat",
    icon: Bot,
  },
  {
    title: "Notice Responder",
    url: "/ai-tools",
    icon: MessageSquare,
  },
  {
    title: "ITR Planner",
    url: "/returns",
    icon: TrendingUp,
  },
  {
    title: "Subscriptions",
    url: "/subscription",
    icon: CreditCard,
  },
  {
    title: "Admin Control",
    url: "/admin",
    icon: ShieldCheck,
  },
];

const legalItems = [
  {
    title: "About Us",
    url: "/about",
  },
  {
    title: "Privacy Policy",
    url: "/privacy",
  },
  {
    title: "Terms of Service",
    url: "/terms",
  }
];

export function AppSidebar() {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const isAdmin = user?.email === 'waseemkhanjdpr@gmail.com';

  const menuItems = items.filter(item => {
    if (item.url === '/admin') return isAdmin;
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4 flex flex-row items-center justify-between">
        <div 
          className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="bg-primary text-primary-foreground p-1 rounded-lg flex items-center justify-center h-8 w-8">
            <span className="text-sm">G</span>
          </div>
          <span className="group-data-[collapsible=icon]:hidden bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            GSTSmartAI.com
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="group-data-[collapsible=icon]:hidden rounded-full hover:bg-muted"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 py-3">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  render={<button onClick={() => navigate(item.url)} />}
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                  className={`
                    h-12 px-4 py-6 rounded-xl transition-all duration-200 group/item
                    ${location.pathname === item.url 
                      ? 'bg-primary/10 border-r-4 border-primary shadow-sm' 
                      : 'hover:bg-muted/80'}
                  `}
                >
                  <item.icon className={`
                    h-6 w-6 transition-transform duration-200 group-hover/item:scale-110
                    ${location.pathname === item.url ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                  <span className={`
                    text-base font-bold tracking-tight
                    ${location.pathname === item.url ? 'text-primary' : 'text-foreground/80'}
                  `}>
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
           <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 py-3">Legal & Support</SidebarGroupLabel>
           <SidebarGroupContent>
              <SidebarMenu>
                 {legalItems.map((item) => (
                   <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        size="sm"
                        render={<button onClick={() => navigate(item.url)} />}
                        className="h-9 opacity-70 hover:opacity-100"
                      >
                         <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                      </SidebarMenuButton>
                   </SidebarMenuItem>
                 ))}
              </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="w-full" />}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 text-left text-sm group-data-[collapsible=icon]:hidden">
              <span className="font-semibold truncate">{user?.displayName}</span>
              <span className="text-xs text-muted-foreground capitalize">{profile?.plan} Plan</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
