import MainDashboardStudent from "views/student/dashboard";
import StudentProfile from "views/student/profile/index";
import StudentTasksPage from "views/student/tasks/index";
import StudentTaskDetail from "views/student/tasks/TaskDetail";
import CompletedTasksPage from "views/student/completed-tasks/index";
import WeakTopicsPage from "views/student/weak-topics/index";
import {
  MdHome,
  MdPerson,
  MdAssignment,
  MdCheckCircle,
  MdTrendingDown,
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
    name: "Bajargan vazifalarim",
    layout: "/student",
    path: "completed-tasks",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <CompletedTasksPage />,
    stranger: false,
  },

  {
    name: "O'zlashtira olmagan mavzularim",
    layout: "/student",
    path: "weak-topics",
    icon: <MdTrendingDown className="h-6 w-6" />,
    component: <WeakTopicsPage />,
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
