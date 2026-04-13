import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import routes from "../../../routes/teacher";

const TeacherSidebar = ({ open, onClose }) => {
  const location = useLocation();

  const activeRoute = (fullPath) => {
    return matchPath({ path: fullPath, end: false }, location.pathname);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.layout === "/teacher" && !route.hidden) {
        const fullPath = route.layout + "/" + route.path;
        const isActive = activeRoute(fullPath);

        return (
          <Link
            key={index}
            to={fullPath}
            onClick={onClose}
            className={`group relative mx-4 mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <span className="text-xl">{route.icon || "📊"}</span>
            <span className="flex-1 font-medium">{route.name}</span>

            {isActive && (
              <div className="absolute -right-4 top-0 h-full w-1 bg-green-500" />
            )}
          </Link>
        );
      }
      return null;
    });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 transform overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900
        ${open ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 xl:hidden p-2"
        >
          <HiX className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="border-b px-6 py-6">
          <h1 className="text-lg font-bold">edu.uz</h1>
          <p className="text-xs text-gray-500">O'qituvchi paneli</p>
        </div>

        {/* Menu */}
        <div className="px-2 py-4">
          {createLinks(routes)}
        </div>

        {/* Logout */}
        <div className="mt-auto p-4">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/admin/login";
            }}
            className="flex w-full items-center gap-2 text-red-600"
          >
            <FiLogOut />
            Chiqish
          </button>
        </div>
      </div>
    </>
  );
};

export default TeacherSidebar;