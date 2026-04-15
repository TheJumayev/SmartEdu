import TeacherDashboard from "views/teacher/default";
import TeacherProfile from "views/teacher/profile";
import TeacherGroups from "views/teacher/groups/GroupsModern";
import TeacherGroupDetail from "views/teacher/groups/GroupDetailModern";
import TeacherCurriculum from "../views/teacher/curriculum";
import TeacherCurriculumDetail from "../views/teacher/curriculum/CurriculumDetail";
import AiTaskPage from "views/teacher/ai-task/AiTask";
import LessonAiTaskPage from "views/teacher/ai-task/LessonAiTask";
import LessonAiTaskDetail from "views/teacher/ai-task/LessonAiTaskDetail";
import TaskResultsPage from "views/teacher/ai-task/TaskResultsPage";

import {
    MdHome,
    MdPerson,
    MdGroup,
    MdAutoAwesome,
    MdSchool,
} from "react-icons/md";


const teacherRoutes = [
    {
        name: "Bosh sahifa",
        layout: "/teacher",
        path: "default",
        icon: <MdHome className="w-6 h-6" />,
        component: <TeacherDashboard />,
    },
    {
    name: "O‘yinlar",
    layout: "/teacher",
    path: "games",
    component: null,
    icon: <i className="fas fa-gamepad"></i>,
    },
    
    {
        name: "Guruhlar",
        layout: "/teacher",
        path: "groups",
        icon: <MdGroup className="w-6 h-6" />,
        component: <TeacherGroups />,
    },

    {
        name: "O'quv dasturlari",
        layout: "/teacher",
        path: "curriculum",
        icon: <MdSchool className="w-6 h-6" />,
        component: <TeacherCurriculum />,
    },

    {
        name: "Profil",
        layout: "/teacher",
        path: "profile",
        icon: <MdPerson className="w-6 h-6" />,
        component: <TeacherProfile />,
    },
];

export const teacherDetailRoutes = [
    {
        name: "Guruh Detail",
        layout: "/teacher",
        path: "groups/:groupId",
        component: <TeacherGroupDetail />,
    },
    {
        name: "Curriculum Detail",
        layout: "/teacher",
        path: "curriculum/:curriculmId",
        component: <TeacherCurriculumDetail />,
    },
    {
        name: "Dars AI Topshiriq",
        layout: "/teacher",
        path: "lesson-ai/:lessonId",
        component: <LessonAiTaskPage />,
    },
    {
        name: "Dars AI Topshiriq Turi",
        layout: "/teacher",
        path: "lesson-ai/:lessonId/:taskType",
        component: <LessonAiTaskDetail />,
    },
    {
        name: "AI Topshiriq Yaratish",
        layout: "/teacher",
        path: "ai-task",
        icon: <MdAutoAwesome className="w-6 h-6" />,
        component: <AiTaskPage />,
    },
    {
        name: "Topshiriq Natijalari",
        layout: "/teacher",
        path: "task-results/:taskId",
        component: <TaskResultsPage />,
    },
];

export default teacherRoutes;

