import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  LayoutDashboard,
  Users,
  Calendar,
  Coins,
  BarChart,
  Mail,
  MessageSquare,
  Activity,
  Database,
  ShoppingBag,
  ListChecks,
  Brain,
  Bell,
  GitBranch,
  MessageCircle,
  HelpCircle,
  UserCog,
  ShieldAlert,
  LucideIcon
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches } from "@/hooks/useBranches";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useSidebar } from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const dashboardMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  }
];

const memberMenuItems = [
  {
    title: "Member List",
    url: "/members/list",
    icon: Users
  },
  {
    title: "Add New Member",
    url: "/members/create",
    icon: Users
  }
];

const trainerMenuItems = [
  {
    title: "Trainer Management",
    url: "/trainers/management",
    icon: UserCog
  }
];

const classMenuItems = [
  {
    title: "Class List",
    url: "/classes/list",
    icon: ListChecks
  }
];

const financeMenuItems = [
  {
    title: "Finance Dashboard",
    url: "/finance/dashboard",
    icon: Coins
  },
  {
    title: "Transactions",
    url: "/finance/transactions",
    icon: BarChart
  }
];

const membershipMenuItems = [
  {
    title: "Membership Dashboard",
    url: "/membership/dashboard",
    icon: Calendar
  },
  {
    title: "Membership Plans",
    url: "/membership/plans",
    icon: BarChart
  }
];

const leadsMenuItems = [
  {
    title: "Lead List",
    url: "/leads/list",
    icon: Users
  }
];

const systemMenuItems = [
  {
    title: "System Settings",
    url: "/system/settings",
    icon: Settings
  },
  {
    title: "Email Settings",
    url: "/system/email",
    icon: Mail
  },
  {
    title: "SMS Settings", 
    url: "/system/sms",
    icon: MessageSquare
  },
  {
    title: "WhatsApp Settings",
    url: "/system/whatsapp", 
    icon: MessageCircle
  },
  {
    title: "System Health",
    url: "/system/health",
    icon: Activity
  },
  {
    title: "Backup & Restore",
    url: "/system/backup",  
    icon: Database
  }
];

const storeMenuItems = [
  {
    title: "Member Store",
    url: "/store/member",
    icon: ShoppingBag
  },
  {
    title: "Product Management",
    url: "/store/products",
    icon: ShoppingBag
  }
];

const dietWorkoutMenuItems = [
  {
    title: "Diet & Workout Planner",
    url: "/diet-workout/planner",
    icon: Brain
  }
];

const feedbackMenuItems = [
  {
    title: "Feedback Management",
    url: "/feedback/management",
    icon: Bell
  }
];

const taskMenuItems = [
  {
    title: "Task Management",
    url: "/tasks/management",
    icon: ListChecks
  }
];

const branchMenuItems = [
  {
    title: "Branch Management",
    url: "/branches/management",
    icon: GitBranch
  }
];

export const AppSidebar = () => {
  const { authState } = useAuth();
  const { branches, isLoading: isBranchesLoading } = useBranches();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { state } = useSidebar();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const renderMenuItems = (items: MenuItem[], category: string) => {
    return items.map((item) => (
      <li key={item.url}>
        <NavLink
          to={item.url}
          className={({ isActive }) =>
            `flex items-center text-sm font-medium py-2 px-4 rounded-md transition-colors hover:bg-secondary ${
              isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`
          }
        >
          <item.icon className="w-4 h-4 mr-2" />
          {item.title}
        </NavLink>
      </li>
    ));
  };

  return (
    <>
      <Sheet open={state === "expanded"} onOpenChange={() => {}}>
        <SheetContent side="left" className="w-full sm:w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6">
              <SheetHeader className="px-4 py-2">
                <SheetTitle>
                  {isBranchesLoading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    branches?.find((branch) => branch.id === authState.user?.branchId)
                      ?.name || "Select Branch"
                  )}
                </SheetTitle>
                <SheetDescription>
                  {authState.isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    authState.user?.email
                  )}
                </SheetDescription>
              </SheetHeader>
              <Separator className="my-2" />
            </div>
            <nav className="flex-1 px-4 py-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="dashboard">
                  <AccordionTrigger className="text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(dashboardMenuItems, "dashboard")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="members">
                  <AccordionTrigger className="text-sm font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(memberMenuItems, "members")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="trainers">
                  <AccordionTrigger className="text-sm font-medium">
                    <UserCog className="w-4 h-4 mr-2" />
                    Trainers
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(trainerMenuItems, "trainers")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="classes">
                  <AccordionTrigger className="text-sm font-medium">
                    <ListChecks className="w-4 h-4 mr-2" />
                    Classes
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(classMenuItems, "classes")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="finance">
                  <AccordionTrigger className="text-sm font-medium">
                    <Coins className="w-4 h-4 mr-2" />
                    Finance
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(financeMenuItems, "finance")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="membership">
                  <AccordionTrigger className="text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Membership
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(membershipMenuItems, "membership")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="leads">
                  <AccordionTrigger className="text-sm font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    Leads
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(leadsMenuItems, "leads")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="store">
                  <AccordionTrigger className="text-sm font-medium">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Store
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(storeMenuItems, "store")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="diet-workout">
                  <AccordionTrigger className="text-sm font-medium">
                    <Brain className="w-4 h-4 mr-2" />
                    Diet & Workout
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(dietWorkoutMenuItems, "diet-workout")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="feedback">
                  <AccordionTrigger className="text-sm font-medium">
                    <Bell className="w-4 h-4 mr-2" />
                    Feedback
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(feedbackMenuItems, "feedback")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-sm font-medium">
                    <ListChecks className="w-4 h-4 mr-2" />
                    Tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(taskMenuItems, "tasks")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="branches">
                  <AccordionTrigger className="text-sm font-medium">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Branches
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(branchMenuItems, "branches")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="system">
                  <AccordionTrigger className="text-sm font-medium">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    System
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-2 space-y-1">
                      {renderMenuItems(systemMenuItems, "system")}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </nav>
            <Separator />
            <div className="p-4">
              <ModeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div
        className={`hidden md:flex flex-col w-64 border-r bg-background transition-all duration-300 ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-center h-16 shrink-0">
          <SheetHeader className="px-4 py-2">
            <SheetTitle>
              {isBranchesLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                branches?.find((branch) => branch.id === authState.user?.branchId)
                  ?.name || "Select Branch"
              )}
            </SheetTitle>
            <SheetDescription>
              {authState.isLoading ? <Skeleton className="h-4 w-24" /> : authState.user?.email}
            </SheetDescription>
          </SheetHeader>
        </div>
        <Separator />
        <nav className="flex-1 px-2 py-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="dashboard">
              <AccordionTrigger className="text-sm font-medium">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(dashboardMenuItems, "dashboard")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="members">
              <AccordionTrigger className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Members
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(memberMenuItems, "members")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="trainers">
              <AccordionTrigger className="text-sm font-medium">
                <UserCog className="w-4 h-4 mr-2" />
                Trainers
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(trainerMenuItems, "trainers")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="classes">
              <AccordionTrigger className="text-sm font-medium">
                <ListChecks className="w-4 h-4 mr-2" />
                Classes
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(classMenuItems, "classes")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="finance">
              <AccordionTrigger className="text-sm font-medium">
                <Coins className="w-4 h-4 mr-2" />
                Finance
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(financeMenuItems, "finance")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="membership">
              <AccordionTrigger className="text-sm font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Membership
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(membershipMenuItems, "membership")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="leads">
              <AccordionTrigger className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Leads
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(leadsMenuItems, "leads")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="store">
              <AccordionTrigger className="text-sm font-medium">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Store
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(storeMenuItems, "store")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="diet-workout">
              <AccordionTrigger className="text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                Diet & Workout
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(dietWorkoutMenuItems, "diet-workout")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feedback">
              <AccordionTrigger className="text-sm font-medium">
                <Bell className="w-4 h-4 mr-2" />
                Feedback
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(feedbackMenuItems, "feedback")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tasks">
              <AccordionTrigger className="text-sm font-medium">
                <ListChecks className="w-4 h-4 mr-2" />
                Tasks
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(taskMenuItems, "tasks")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="branches">
              <AccordionTrigger className="text-sm font-medium">
                <GitBranch className="w-4 h-4 mr-2" />
                Branches
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(branchMenuItems, "branches")}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="system">
              <AccordionTrigger className="text-sm font-medium">
                <ShieldAlert className="w-4 h-4 mr-2" />
                System
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-2 space-y-1">
                  {renderMenuItems(systemMenuItems, "system")}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>
        <Separator />
        <div className="p-4">
          <ModeToggle />
        </div>
      </div>
    </>
  );
};
