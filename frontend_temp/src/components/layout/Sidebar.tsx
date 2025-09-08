"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import {
  Home,
  Car,
  Users,
  Settings,
  BarChart3,
  Clock,
  X,
  Wifi,
  WifiOff,
  User,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { classNames } from "@/utils/helpers";
import { useWebSocket } from "@/hooks/useWebSocket";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("admin" | "employee" | "visitor")[];
  badge?: number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: Home,
    roles: ["admin", "employee", "visitor"],
  },
  {
    id: "gates",
    label: "Gates",
    href: "/gates",
    icon: Car,
    roles: ["admin", "employee", "visitor"],
    children: [
      {
        id: "gate-1",
        label: "Main Entrance",
        href: "/gate/gate_1",
        icon: Car,
        roles: ["admin", "employee", "visitor"],
      },
      {
        id: "gate-2",
        label: "Secondary Gate",
        href: "/gate/gate_2",
        icon: Car,
        roles: ["admin", "employee", "visitor"],
      },
    ],
  },
  {
    id: "checkpoint",
    label: "Checkpoint",
    href: "/checkpoint",
    icon: Users,
    roles: ["admin", "employee"],
  },
  {
    id: "admin",
    label: "Admin Panel",
    href: "/admin",
    icon: Settings,
    roles: ["admin"],
    children: [
      {
        id: "admin-overview",
        label: "Overview",
        href: "/admin?tab=overview",
        icon: BarChart3,
        roles: ["admin"],
      },
      {
        id: "admin-revenue",
        label: "Revenue Analytics",
        href: "/admin?tab=revenue",
        icon: BarChart3,
        roles: ["admin"],
      },
      {
        id: "admin-subscriptions",
        label: "Subscriptions",
        href: "/admin?tab=subscriptions",
        icon: Users,
        roles: ["admin"],
      },
      {
        id: "admin-monitoring",
        label: "Live Monitor",
        href: "/admin?tab=monitoring",
        icon: Activity,
        roles: ["admin"],
      },
      {
        id: "admin-zones",
        label: "Zone Control",
        href: "/admin?tab=zones",
        icon: Car,
        roles: ["admin"],
      },
      {
        id: "admin-categories",
        label: "Categories",
        href: "/admin?tab=categories",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { connectionState } = useWebSocket();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-expand current section
  useEffect(() => {
    const currentItem = navigationItems.find(
      (item) =>
        item.href === pathname ||
        item.children?.some((child) => child.href === pathname)
    );
    if (currentItem) {
      setExpandedItems((prev) => new Set([...prev, currentItem.id]));
    }
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some((child) => child.href === pathname);
    }
    return false;
  };

  const canAccessItem = (item: NavItem) => {
    if (!item.roles) return true;
    if (!user) return item.roles.includes("visitor");
    return item.roles.includes(user.role);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!canAccessItem(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.href);
            }
          }}
          className={classNames(
            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative",
            level > 0 ? "ml-4" : "",
            isActive
              ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
            isCollapsed && "lg:justify-center lg:px-2"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <div
            className={classNames(
              "flex items-center space-x-3",
              isCollapsed && "lg:space-x-0"
            )}
          >
            <item.icon
              className={classNames(
                "w-5 h-5 transition-colors flex-shrink-0",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-gray-700",
                isCollapsed && "lg:mx-auto"
              )}
            />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <div
              className={classNames(
                "transition-transform duration-200",
                isExpanded ? "rotate-90" : ""
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          )}
        </button>

        {!isCollapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out",
          // Mobile: show/hide based on sidebarOpen
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, adjust width based on collapsed state
          "lg:translate-x-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ParkFlow</span>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Car className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Collapse toggle - only on desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            {/* Close button - only on mobile */}
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info - only show when not collapsed */}
        {!isCollapsed && isMounted && isAuthenticated && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status - only show when not collapsed */}
        {!isCollapsed && isMounted && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionState === "open" ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span
                className={classNames(
                  "text-xs font-medium",
                  connectionState === "open" ? "text-green-600" : "text-red-600"
                )}
              >
                {connectionState === "open" ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigationItems?.map((item) => renderNavItem(item))}
        </nav>

        {/* Footer - only show when not collapsed */}
        {!isCollapsed && isMounted && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
