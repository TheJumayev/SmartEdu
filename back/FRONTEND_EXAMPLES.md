# 🎯 Frontend Misollari - Student Vazifalarini Olish

## 📦 Service/Hook - Vazifalarni Olish

### Fayl: `hooks/useTaskService.js`

```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('access_token');

  // Dars bo'yicha barcha vazifalarni olish
  const getTasksByLesson = useCallback(async (lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/task/lesson/${lessonId}`,
        {
          headers: { Authorization: getToken() }
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Vaziafani ID'si bo'yicha olish
  const getTaskById = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/task/${taskId}`,
        {
          headers: { Authorization: getToken() }
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // O'qituvchi bo'yicha vazifalarni olish
  const getTasksByTeacher = useCallback(async (teacherId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/task/teacher/${teacherId}`,
        {
          headers: { Authorization: getToken() }
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Tasdiqlanmagan vazifalarni olish
  const getUnapprovedTasks = useCallback(async (lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/task/lesson/${lessonId}/unapproved`,
        {
          headers: { Authorization: getToken() }
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getTasksByLesson,
    getTaskById,
    getTasksByTeacher,
    getUnapprovedTasks,
  };
};
```

---

## 🎨 Component - Dars Vazifalarini Ko'rsatish

### Fayl: `components/LessonTaskList.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useTaskService } from '../hooks/useTaskService';
import { MdCheckCircle, MdPending, MdDelete, MdEdit } from 'react-icons/md';

const LessonTaskList = ({ lessonId, lessonName }) => {
  const { loading, error, getTasksByLesson } = useTaskService();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, approved, unapproved

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasksByLesson(lessonId);
        setTasks(data);
      } catch (err) {
        console.error('Vazifalarni olishda xato:', err);
      }
    };

    if (lessonId) {
      fetchTasks();
    }
  }, [lessonId, getTasksByLesson]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'approved') return task.approved;
    if (filter === 'unapproved') return !task.approved;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Vazifalar yuklanmoqda...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Xato: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {lessonName} - Vazifalar ({filteredTasks.length})
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Hammasini Ko'rsat
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tasdiqlanmagan
        </button>
        <button
          onClick={() => setFilter('unapproved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unapproved'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tasdiq Kutmoqda
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Bu dars uchun vazifalar topilmadi</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// Kichik component - Bitta vazifa kartasi
const TaskCard = ({ task }) => {
  const getTypeColor = (type) => {
    const colors = {
      TEST: 'bg-purple-100 text-purple-800',
      SELF: 'bg-blue-100 text-blue-800',
      MATCHING: 'bg-green-100 text-green-800',
      CROSSWORD: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-600">O'qituvchi: {task.teacherName}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
            task.type
          )}`}
        >
          {task.type}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        {task.approved ? (
          <>
            <MdCheckCircle className="text-green-500" />
            <span className="text-xs text-green-700 font-medium">Tasdiqlanmagan</span>
          </>
        ) : (
          <>
            <MdPending className="text-yellow-500" />
            <span className="text-xs text-yellow-700 font-medium">Tasdiq Kutmoqda</span>
          </>
        )}
      </div>

      {/* Questions Count */}
      <div className="text-sm text-gray-600 mb-4">
        📚 Savollar: <span className="font-semibold">{task.questions?.length || 0}</span> ta
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition">
          Ochish
        </button>
        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
          <MdEdit className="w-4 h-4" />
        </button>
        <button className="px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 transition">
          <MdDelete className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LessonTaskList;
```

---

## 📄 Component - Vaziafa Detallarini Ko'rsatish

### Fayl: `components/TaskDetail.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useTaskService } from '../hooks/useTaskService';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { loading, error, getTaskById } = useTaskService();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTaskById(taskId);
        setTask(data);
      } catch (err) {
        console.error('Vazifani olishda xato:', err);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, getTaskById]);

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  if (error || !task) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Vazifa topilmadi: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
      >
        <MdArrowBack /> Orqaga
      </button>

      {/* Task Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Turi</p>
            <p className="font-semibold">{task.type}</p>
          </div>
          <div>
            <p className="text-gray-600">O'qituvchi</p>
            <p className="font-semibold">{task.teacherName}</p>
          </div>
          <div>
            <p className="text-gray-600">Dars</p>
            <p className="font-semibold">{task.lessonName}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className={`font-semibold ${task.approved ? 'text-green-600' : 'text-yellow-600'}`}>
              {task.approved ? 'Tasdiqlanmagan' : 'Tasdiq Kutmoqda'}
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Savollar ({task.questions?.length || 0})</h2>
        
        {(!task.questions || task.questions.length === 0) ? (
          <p className="text-gray-500">Savollar topilmadi</p>
        ) : (
          task.questions.map((question, index) => (
            <QuestionItem key={index} question={question} index={index + 1} />
          ))
        )}
      </div>
    </div>
  );
};

// Kichik Component - Bitta savol
const QuestionItem = ({ question, index }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-2">
        {index}. {question.questionText}
      </h3>
      
      {question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-3">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`p-2 border rounded ${
                option === question.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              }`}
            >
              {option}
              {option === question.correctAnswer && (
                <span className="ml-2 text-green-600 font-semibold">✓ To'g'ri javob</span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">
        <span className="font-semibold">Turı:</span> {question.type}
      </p>
    </div>
  );
};

export default TaskDetail;
```

---

## 🔧 Context API - Vazifa Holatini Boshqarish

### Fayl: `context/TaskContext.js`

```javascript
import React, { createContext, useState, useCallback } from 'react';
import { useTaskService } from '../hooks/useTaskService';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { getTasksByLesson, getTaskById } = useTaskService();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLessonTasks = useCallback(async (lessonId) => {
    setLoading(true);
    try {
      const data = await getTasksByLesson(lessonId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [getTasksByLesson]);

  const selectTask = useCallback(async (taskId) => {
    setLoading(true);
    try {
      const data = await getTaskById(taskId);
      setSelectedTask(data);
    } finally {
      setLoading(false);
    }
  }, [getTaskById]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        selectedTask,
        loading,
        loadLessonTasks,
        selectTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
```

---

## 📱 Complete Page - Vazifalar Halaqatni

### Fayl: `pages/StudentTasksPage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LessonTaskList from '../components/LessonTaskList';

const StudentTasksPage = () => {
  const { lessonId } = useParams();
  const [lessonInfo, setLessonInfo] = useState(null);

  useEffect(() => {
    // Dars ma'lumotlarini olish (opsional)
    // Bu endpoint olish uchun LessonController'dan foydalanamiz
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/lessons/${lessonId}`,
          {
            headers: { Authorization: token },
          }
        );
        const data = await response.json();
        setLessonInfo(data?.data || data);
      } catch (error) {
        console.error('Dars ma\'lumotlarini olishda xato:', error);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <LessonTaskList
          lessonId={lessonId}
          lessonName={lessonInfo?.name || 'Dars'}
        />
      </div>
    </div>
  );
};

export default StudentTasksPage;
```

---

## 🔌 Axios Interceptor - Avtomatik Authorization

### Fayl: `utils/axiosConfig.js`

```javascript
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const instance = axios.create({
  baseURL: baseUrl,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
```

---

## 🚀 Usage Misollari

### Oddiy ishlatish:
```javascript
import { useTaskService } from '../hooks/useTaskService';

const MyComponent = ({ lessonId }) => {
  const { getTasksByLesson } = useTaskService();
  
  const handleClick = async () => {
    const tasks = await getTasksByLesson(lessonId);
    console.log(tasks);
  };

  return <button onClick={handleClick}>Vazifalarni Olish</button>;
};
```

### Context bilan ishlatish:
```javascript
import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

const MyComponent = ({ lessonId }) => {
  const { tasks, loading, loadLessonTasks } = useContext(TaskContext);

  useEffect(() => {
    loadLessonTasks(lessonId);
  }, [lessonId]);

  return (
    <div>
      {loading ? 'Yuklanmoqda...' : tasks.map(t => <div>{t.title}</div>)}
    </div>
  );
};
```

---

## ✅ Checklist - Frontend Integration

- [ ] useTaskService hook qo'shildi
- [ ] LessonTaskList component qo'shildi
- [ ] TaskDetail component qo'shildi
- [ ] TaskContext qo'shildi (opsional)
- [ ] Axios interceptor sozlandi
- [ ] Environment variables (.env) o'rnatildi
- [ ] Router'ga yangi routes qo'shildi
- [ ] API documentation o'qildi va tushunildi

