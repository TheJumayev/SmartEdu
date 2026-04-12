import MainDashboardStudent from "views/student/dashboard";
import StudentProfile from "views/student/profile/index";
import StudentTasksPage from "views/student/tasks/index";
import StudentTaskDetail from "views/student/tasks/TaskDetail";
import {
  MdHome,
  MdPerson,
  MdAssignment,
} from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/student",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardStudent />,
    stranger: false,
    url: "",
  },

  {
    name: "Vazifalar",
    layout: "/student",
    path: "tasks",
    icon: <MdAssignment className="h-6 w-6" />,
    component: <StudentTasksPage />,
    stranger: false,
  },

  {
    name: "Profil",
    layout: "/student",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <StudentProfile />,
    stranger: false,
  },
];

export const studentDetailRoutes = [
  {
    name: "Vazifa Detali",
    layout: "/student",
    path: "tasks/:taskId",
    component: <StudentTaskDetail />,
  },
];

export default routes;
