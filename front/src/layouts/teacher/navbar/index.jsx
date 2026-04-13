import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiAlignJustify,
  FiSearch,
  FiBell,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { MdPerson } from "react-icons/md";

const TeacherNavbar = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onOpenSidenav } = props;

  const [darkmode, setDarkmode] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // ✅ FIX: user ni load qilish
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ name: "O'qituvchi" });
    }
  }, []);

  const logOut = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // ❗ faqat login page da yashirinadi
  if (location.pathname === "/admin/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSidenav}
              className="xl:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <FiAlignJustify className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-teal-600">
                  <span className="text-sm font-bold text-white">🎓</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Smart edu
                </span>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="hidden flex-1 md:flex md:max-w-xs">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2">
              <FiBell />
            </button>

            <button
              onClick={() => {
                document.body.classList.toggle("dark");
                setDarkmode(!darkmode);
              }}
              className="p-2"
            >
              {darkmode ? <RiSunFill /> : <RiMoonFill />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2"
              >
                <MdPerson />
                <span className="hidden sm:inline">
                  {user?.name?.split(" ")[0]}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg dark:bg-gray-800">
                  <Link to="/teacher/profile">Profil</Link>
                  <button onClick={logOut}>Chiqish</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default TeacherNavbar;