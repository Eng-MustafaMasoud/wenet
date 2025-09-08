"use client";

import { User } from "@/types/api";
import { LogOut, User as UserIcon, Settings, Shield } from "lucide-react";
import { classNames } from "@/utils/helpers";

interface UserMenuProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: UserIcon,
      href: "/profile",
      onClick: () => {
        onClose();
        // Navigate to profile
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
      onClick: () => {
        onClose();
        // Navigate to settings
      },
    },
  ];

  // Add admin-specific menu items
  if (user.role === "admin") {
    menuItems.push({
      id: "admin",
      label: "Admin Panel",
      icon: Shield,
      href: "/admin",
      onClick: () => {
        onClose();
        // Navigate to admin
      },
    });
  }

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
      <div className="py-1">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user.username}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={classNames(
                "w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4 mr-3 text-gray-400" />
              {item.label}
            </button>
          );
        })}

        {/* Logout */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
