import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package2 },
  { name: "Inventory", href: "/inventory", icon: ClipboardList },
  { name: "Users", href: "/users", icon: Users, adminOnly: true },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex h-full flex-col gap-y-5 bg-sidebar overflow-y-auto border-r">
      <div className="flex h-16 shrink-0 items-center px-6 text-lg font-semibold">
        <Package2 className="mr-2 h-6 w-6" />
        Inventory Manager
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                if (item.adminOnly && !user?.isAdmin) return null;
                
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          location === item.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold mx-2"
                        )}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          <li className="mt-auto p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
