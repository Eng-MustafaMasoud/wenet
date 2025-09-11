"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Wifi,
  WifiOff,
  Settings,
} from "lucide-react";
import { classNames } from "@/utils/helpers";
import { useWebSocket } from "@/hooks/useWebSocket";

// Lazy load components for better performance
const UserMenu = lazy(() => import("./UserMenu"));
const NotificationPanel = lazy(() => import("./NotificationPanel"));

interface NavigationProps {
  title?: string;
  showConnectionStatus?: boolean;
  gateId?: string;
  sidebarCollapsed?: boolean;
}

export default function Navigation({
  title = "Parking Management System",
  showConnectionStatus = false,
  gateId,
  sidebarCollapsed = false,
}: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { connectionState } = useWebSocket(gateId);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update notifications count based on WebSocket updates
  useEffect(() => {
    if (connectionState === "open") {
      // Reset notification count when connected
      setNotifications(0);
    }
  }, [connectionState]);

  const handleLogout = () => {
    dispatch({ type: "auth/logout" });
    router.push("/login");
  };

  const getConnectionStatus = () => {
    if (!showConnectionStatus) return null;

    switch (connectionState) {
      case "connecting":
        return (
          <div className="flex items-center text-yellow-600">
            <Wifi className="w-4 h-4 mr-1 animate-pulse" />
            <span className="text-sm">Connecting...</span>
          </div>
        );
      case "open":
        return (
          <div className="flex items-center text-green-600">
            <Wifi className="w-4 h-4 mr-1" />
            <span className="text-sm">Connected</span>
          </div>
        );
      case "closed":
      case "error":
        return (
          <div className="flex items-center text-red-600">
            <WifiOff className="w-4 h-4 mr-1" />
            <span className="text-sm">Disconnected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header
        className={classNames(
          "bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out",
          // Desktop: adjust left position based on sidebar state
          sidebarCollapsed ? "lg:left-16" : "lg:left-64",
          // Mobile: full width
          "left-0"
        )}
      >
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Left side - Menu button and title */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open sidebar</span>
              {sidebarOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Title and connection status */}
            <div className="flex items-center ml-4">
              <h1
                className="hidden sm:block text-xl font-semibold text-gray-900 truncate"
                suppressHydrationWarning
              >
                {title}
              </h1>
              {showConnectionStatus && (
                <div className="ml-4 hidden md:block">
                  {getConnectionStatus()}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Notifications, User menu, etc. */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {isMounted && isAuthenticated && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? "9+" : notifications}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {isMounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <Suspense
                    fallback={
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                        Loading...
                      </div>
                    }
                  >
                    <UserMenu
                      user={user}
                      onClose={() => setShowUserMenu(false)}
                      onLogout={handleLogout}
                    />
                  </Suspense>
                )}
              </div>
            ) : isMounted ? (
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            ) : (
              <div className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600">
                Login
              </div>
            )}

            {/* Settings */}
            {/* {isMounted && isAuthenticated && (
              <button
                onClick={() => router.push("/settings")}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="h-5 w-5" />
              </button>
            )} */}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <Suspense
          fallback={
            <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg z-50">
              Loading notifications...
            </div>
          }
        >
          <NotificationPanel
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
          />
        </Suspense>
      )}

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
}
