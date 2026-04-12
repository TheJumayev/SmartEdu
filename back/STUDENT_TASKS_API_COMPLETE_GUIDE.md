# 📚 STUDENT VAZIFALARINI OLISH - TO'LIQ DOKUMENTATSIYA

**Yaratilgan:** 2026-04-12  
**Status:** ✅ COMPLETE  
**Versiya:** 1.0

---

## 📖 MUNDARIJA

1. [TEZKOR BOSHLASH](#tezkor-boshlash-quick-start)
2. [API DOKUMENTATSIYASI](#api-dokumentatsiyasi)
3. [FRONTEND MISOLLARI](#frontend-misollari)
4. [TESTING VA DEBUGGING](#testing-va-debugging)
5. [IMPLEMENTATSIYA CHECKLIST](#implementatsiya-checklist)
6. [TROUBLESHOOTING](#troubleshooting)

---

# 🚀 TEZKOR BOSHLASH (QUICK START)

## 📋 Tez O'zlashtirish Qo'llanmasi

Bu qo'llanma student vazifalarini (tasks) olish uchun API'larni qanday ishlatishni tushuntiradi.

---

## 🔑 5 ta Asosiy Endpoint

### 1. **Dars Bo'yicha Barcha Vazifalarni Olish**
```bash
GET http://localhost:8080/api/v1/task/lesson/{lessonId}
```
**Javob:** Bu dars uchun barcha vazifalar ro'yxati

**cURL Misoli:**
```bash
curl -X GET "http://localhost:8080/api/v1/task/lesson/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: YOUR_TOKEN"
```

---

### 2. **Vaziafani ID'si Bo'yicha Olish**
```bash
GET http://localhost:8080/api/v1/task/{taskId}
```
**Javob:** Bitta vaziafaning to'liq detallar

**cURL Misoli:**
```bash
curl -X GET "http://localhost:8080/api/v1/task/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: YOUR_TOKEN"
```

---

### 3. **O'qituvchi Bo'yicha Vazifalarni Olish**
```bash
GET http://localhost:8080/api/v1/task/teacher/{teacherId}
```
**Javob:** Bu o'qituvchining yaratgan vazifalar

**cURL Misoli:**
```bash
curl -X GET "http://localhost:8080/api/v1/task/teacher/223e4567-e89b-12d3-a456-426614174001" \
  -H "Authorization: YOUR_TOKEN"
```

---

### 4. **Tasdiqlanmagan Vazifalarni Olish** (Admin uchun)
```bash
GET http://localhost:8080/api/v1/task/lesson/{lessonId}/unapproved
```
**Javob:** Tasdiq kutmoqda bo'lgan vazifalar

**cURL Misoli:**
```bash
curl -X GET "http://localhost:8080/api/v1/task/lesson/123e4567-e89b-12d3-a456-426614174000/unapproved" \
  -H "Authorization: YOUR_TOKEN"
```

---

### 5. **Yangi Vazifa Yaratish**
```bash
POST http://localhost:8080/api/v1/task/save/{userId}/{lessonId}
```

**Body:**
```json
{
  "title": "Python Asoslari - Test",
  "type": "TEST",
  "approved": false,
  "questions": [
    {
      "question": "Python nima?",
      "optionA": "Dasturlash tili",
      "optionB": "Ilon",
      "optionC": "Kitob",
      "optionD": "Olma",
      "correctAnswer": "A"
    }
  ]
}
```

---

## 🎯 Javobning Tuzilishi

```json
{
  "id": "uuid-string",
  "title": "Vazifa sarlavhasi",
  "type": "TEST",
  "approved": false,
  "teacherName": "Ism Familya",
  "teacherId": "uuid-string",
  "lessonName": "Dars nomi",
  "lessonId_response": "uuid-string",
  "questions": [
    {
      "question": "Savol matni",
      "optionA": "Variant A",
      "optionB": "Variant B",
      "optionC": "Variant C",
      "optionD": "Variant D",
      "correctAnswer": "A"
    }
  ]
}
```

---

## 📱 JavaScript/React Misoli

### Simple Function
```javascript
async function getTasksByLesson(lessonId) {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/task/lesson/${lessonId}`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const tasks = await response.json();
    console.log('Vazifalar:', tasks);
    return tasks;
  } catch (error) {
    console.error('Xato:', error);
  }
}

// Ishlatish:
getTasksByLesson('123e4567-e89b-12d3-a456-426614174000');
```

### React Hook
```javascript
import { useState, useEffect } from 'react';

function StudentTasks({ lessonId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    fetch(`http://localhost:8080/api/v1/task/lesson/${lessonId}`, {
      headers: { 'Authorization': token }
    })
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Xato:', err);
        setLoading(false);
      });
  }, [lessonId]);

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div>
      <h2>Vazifalar ({tasks.length})</h2>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>Turi: {task.type}</p>
          <p>O'qituvchi: {task.teacherName}</p>
          <p>Savollar: {task.questions?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}

export default StudentTasks;
```

---

## 🔒 Authorization

**Barcha so'rovlarda token zarur:**
```
Authorization: <access_token>
```

Token'ni qabul qilish (Login'dan keyin):
```javascript
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ phone, password })
});

const { access_token } = await response.json();
localStorage.setItem('access_token', access_token);
```

---

## ⚠️ Xato Kodlari

| Kod | Ma'nosi |
|-----|---------|
| `200` | Muvaffaqiyatli |
| `400` | Xato parametrlar |
| `401` | Autentifikatsiya talab |
| `404` | Topilmadi |
| `500` | Server xatosi |

---

## 📊 Vazifa Turlari (TaskType Enum)

```
TEST       - Test shaklidagi savollari bilan
SELF       - Mustaqil ish
MATCHING   - Moslashtirish o'yini
CROSSWORD  - Krossord jumboq
```

---

## ✅ Integration Checklist (QUICK START)

- [ ] `/api/v1/task/lesson/{lessonId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/{taskId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/teacher/{teacherId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/lesson/{lessonId}/unapproved` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/save/{userId}/{lessonId}` - POST endpoint sinov qilindi
- [ ] Frontend komponenti yaratildi
- [ ] Styling o'rnatildi
- [ ] Error handling qo'shildi

---

# 📚 API DOKUMENTATSIYASI

## 🎯 Umumiy Ma'lumot
Bu dokumentatsiya student vazifalarini (task/assignment) olish uchun backend API'larni tavsiflab beradi.

---

## 1️⃣ Barcha Vazifalarni Dars Bo'yicha Olish

### Endpoint
```
GET /api/v1/task/lesson/{lessonId}
```

### Tavsif
Muayyan dars uchun barcha vazifalarni qaytaradi (tasdiqlanmagan va tasdiqlanganlar).

### Parameter
| Parametr | Turi | Majburiy | Tavsif |
|----------|------|---------|--------|
| `lessonId` | UUID | ✅ | Darsning unikal ID'si |

### Response (200 OK)
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Python Asoslari - Test",
    "type": "TEST",
    "approved": true,
    "teacherName": "A.B. Abdullayev",
    "teacherId": "223e4567-e89b-12d3-a456-426614174001",
    "lessonName": "Python Asoslari",
    "lessonId_response": "123e4567-e89b-12d3-a456-426614174000",
    "questions": [
      {
        "id": "q1",
        "questionText": "Python nima?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ]
  }
]
```

---

## 2️⃣ O'qituvchi Bo'yicha Barcha Vazifalarni Olish

### Endpoint
```
GET /api/v1/task/teacher/{teacherId}
```

### Tavsif
Muayyan o'qituvchi tomonidan yaratilgan barcha vazifalarni qaytaradi.

### Parameter
| Parametr | Turi | Majburiy | Tavsif |
|----------|------|---------|--------|
| `teacherId` | UUID | ✅ | O'qituvchining unikal ID'si |

### Response (200 OK)
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Python Asoslari - Test",
    "type": "TEST",
    "approved": true,
    "teacherName": "A.B. Abdullayev",
    "teacherId": "223e4567-e89b-12d3-a456-426614174001",
    "lessonName": "Python Asoslari",
    "lessonId_response": "123e4567-e89b-12d3-a456-426614174000"
  }
]
```

### Frontend Misoli
```javascript
const getTeacherTasks = async (teacherId) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${baseUrl}/api/v1/task/teacher/${teacherId}`,
      {
        headers: { Authorization: token }
      }
    );
    return response.data;
  } catch (error) {
    console.error('O\'qituvchi vazifalarini olishda xato:', error);
  }
};
```

---

## 3️⃣ Dars Bo'yicha Tasdiqlanmagan Vazifalarni Olish

### Endpoint
```
GET /api/v1/task/lesson/{lessonId}/unapproved
```

### Tavsif
Muayyan dars uchun FAQAT tasdiqlanmagan vazifalarni qaytaradi (admin panel uchun foydali).

### Parameter
| Parametr | Turi | Majburiy | Tavsif |
|----------|------|---------|--------|
| `lessonId` | UUID | ✅ | Darsning unikal ID'si |

### Response (200 OK)
```json
[
  {
    "id": "223e4567-e89b-12d3-a456-426614174002",
    "title": "Malumotlar Tuzilmasi - TEST",
    "type": "TEST",
    "approved": false,
    "teacherName": "N.S. Sodiqov",
    "teacherId": "323e4567-e89b-12d3-a456-426614174003",
    "lessonName": "Malumotlar Tuzilmasi",
    "lessonId_response": "123e4567-e89b-12d3-a456-426614174000",
    "questions": []
  }
]
```

---

## 4️⃣ Vazifarni ID Bo'yicha Olish

### Endpoint
```
GET /api/v1/task/{taskId}
```

### Tavsif
Muayyan ID'li vaziafaning to'liq ma'lumotlarini qaytaradi.

### Parameter
| Parametr | Turi | Majburiy | Tavsif |
|----------|------|---------|--------|
| `taskId` | UUID | ✅ | Vaziafaning unikal ID'si |

### Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Python Asoslari - Test",
  "type": "TEST",
  "approved": true,
  "teacherName": "A.B. Abdullayev",
  "teacherId": "223e4567-e89b-12d3-a456-426614174001",
  "lessonName": "Python Asoslari",
  "lessonId_response": "123e4567-e89b-12d3-a456-426614174000",
  "questions": [
    {
      "id": "q1",
      "questionText": "Python nima?",
      "type": "MULTIPLE_CHOICE",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]
}
```

---

## 5️⃣ Yangi Vaziafa Yaratish

### Endpoint
```
POST /api/v1/task/save/{userId}/{lessonId}
```

### Tavsif
O'qituvchi yangi vaziafa yaratadi.

### Parametrlar
| Parametr | Turi | Majburiy | Tavsif |
|----------|------|---------|--------|
| `userId` | UUID | ✅ | O'qituvchi (User) ID'si |
| `lessonId` | UUID | ✅ | Dars ID'si |

### Request Body
```json
{
  "title": "Python Asoslari - Test",
  "type": "TEST",
  "approved": false,
  "questions": [
    {
      "questionText": "Python nima?",
      "options": ["Iloji yok variant 1", "Iloji yok variant 2"],
      "correctAnswer": "Iloji yok variant 1"
    }
  ]
}
```

### Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Python Asoslari - Test",
  "type": "TEST",
  "approved": false,
  "teacherName": "A.B. Abdullayev",
  "teacherId": "223e4567-e89b-12d3-a456-426614174001",
  "lessonName": "Python Asoslari",
  "lessonId_response": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## 📱 Complete React Komponenti Misoli

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskViewer = ({ lessonId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchTasks();
  }, [lessonId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${baseUrl}/api/v1/task/lesson/${lessonId}`,
        {
          headers: { Authorization: token }
        }
      );
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Vazifalarni olishda xato: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dars Vazifálari</h2>
      {tasks.length === 0 ? (
        <p>Vazifalar topilmadi</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600">Turi: {task.type}</p>
            <p className="text-sm text-gray-500">O'qituvchi: {task.teacherName}</p>
            <p className="mt-2 text-sm">Savollar: {task.questions?.length || 0} ta</p>
            <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">
              Ochish
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskViewer;
```

---

## 🛠️ Config File Misoli (Frontend)

```javascript
// config.js yoki .env
export const baseUrl = 'http://localhost:8080';

// API Call Utility
export const ApiCall = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('access_token');
  
  const config = {
    method,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${url}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
```

---

# 🎯 FRONTEND MISOLLARI

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
  const [filter, setFilter] = useState('all');

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {lessonName} - Vazifalar ({filteredTasks.length})
        </h2>
      </div>

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

      <div className="text-sm text-gray-600 mb-4">
        📚 Savollar: <span className="font-semibold">{task.questions?.length || 0}</span> ta
      </div>

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
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
      >
        <MdArrowBack /> Orqaga
      </button>

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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Savollar ({task.questions?.length || 0})</h2>
        
        {(!task.questions || task.questions.length === 0) ? (
          <p className="text-gray-500">Savollar topilmadi</p>
        ) : (
          task.questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-2">
                {index + 1}. {question.questionText}
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
          ))
        )}
      </div>
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

---

# 🧪 TESTING VA DEBUGGING

## 🔄 API Test Qilish Jarayoni

### Step 1: Postman'ni O'rnating

1. [Postman'ni yuklab oling](https://www.postman.com/downloads/)
2. `Postman_Collection.json` faylini import qiling:
   - **File → Import**
   - **Upload Files** → `Postman_Collection.json`

### Step 2: Environment Variable'larni Sozlang

Postman'da yangi environment yarating:

**Variables:**
```
base_url = http://localhost:8080
token = YOUR_ACCESS_TOKEN
lessonId = 123e4567-e89b-12d3-a456-426614174000
taskId = 223e4567-e89b-12d3-a456-426614174002
teacherId = 223e4567-e89b-12d3-a456-426614174001
userId = 223e4567-e89b-12d3-a456-426614174001
```

---

## 🧬 Test Cases

### Test 1: Dars Bo'yicha Barcha Vazifalarni Olish

**Endpoint:** `GET /api/v1/task/lesson/{lessonId}`

**Steps:**
1. Postman'da **GET** so'rov yarating
2. URL: `{{base_url}}/api/v1/task/lesson/{{lessonId}}`
3. Header: `Authorization: {{token}}`
4. **Send** tugmasini bosing

**Expected Response:**
```json
[
  {
    "id": "string",
    "title": "Vazifa nomi",
    "type": "TEST",
    "approved": true,
    "teacherName": "string",
    "teacherId": "uuid",
    "lessonName": "string",
    "lessonId_response": "uuid",
    "questions": [...]
  }
]
```

**✅ Muvaffaqiyatli:** Status `200 OK`

---

### Test 2: Vaziafani ID'si Bo'yicha Olish

**Endpoint:** `GET /api/v1/task/{taskId}`

**Steps:**
1. **GET** so'rov yarating
2. URL: `{{base_url}}/api/v1/task/{{taskId}}`
3. **Send** tugmasini bosing

**Expected Response:** Bitta vazifaning to'liq detallar

**✅ Muvaffaqiyatli:** Status `200 OK`

---

### Test 3: O'qituvchi Bo'yicha Vazifalarni Olish

**Endpoint:** `GET /api/v1/task/teacher/{teacherId}`

**Steps:**
1. **GET** so'rov yarating
2. URL: `{{base_url}}/api/v1/task/teacher/{{teacherId}}`
3. **Send** tugmasini bosing

**✅ Muvaffaqiyatli:** Status `200 OK` va o'qituvchining barcha vazifalar

---

### Test 4: Tasdiqlanmagan Vazifalarni Olish

**Endpoint:** `GET /api/v1/task/lesson/{lessonId}/unapproved`

**Steps:**
1. **GET** so'rov yarating
2. URL: `{{base_url}}/api/v1/task/lesson/{{lessonId}}/unapproved`
3. **Send** tugmasini bosing

**Expected:** Faqat `approved: false` bo'lgan vazifalar

**✅ Muvaffaqiyatli:** Status `200 OK`

---

### Test 5: Yangi Vazifa Yaratish

**Endpoint:** `POST /api/v1/task/save/{userId}/{lessonId}`

**Steps:**
1. **POST** so'rov yarating
2. URL: `{{base_url}}/api/v1/task/save/{{userId}}/{{lessonId}}`
3. **Body** → **raw** → **JSON**:
```json
{
  "title": "Test Vazifa",
  "type": "TEST",
  "approved": false,
  "questions": [
    {
      "question": "1+1 nechaga teng?",
      "optionA": "1",
      "optionB": "2",
      "optionC": "3",
      "optionD": "4",
      "correctAnswer": "B"
    }
  ]
}
```
4. **Send** tugmasini bosing

**✅ Muvaffaqiyatli:** Status `200 OK` va yangi vazifa ID'si qaytadi

---

## 🔍 Frontend Testing

### Step 1: React Komponenti Yaratish

```javascript
// pages/TestTasks.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const lessonId = '123e4567-e89b-12d3-a456-426614174000'; // Test ID

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    
    axios.get(
      `http://localhost:8080/api/v1/task/lesson/${lessonId}`,
      { headers: { Authorization: token } }
    )
      .then(res => {
        setTasks(res.data);
        console.log('✅ Vazifalar yuklandi:', res.data);
      })
      .catch(err => {
        setError(err.message);
        console.error('❌ Xato:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>API Test - Vazifalar</h2>
      {loading && <p>Yuklanmoqda...</p>}
      {error && <p style={{color: 'red'}}>Xato: {error}</p>}
      {tasks.length > 0 ? (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <strong>{task.title}</strong> - {task.type}
            </li>
          ))}
        </ul>
      ) : (
        <p>Vazifalar topilmadi</p>
      )}
    </div>
  );
};

export default TestTasks;
```

---

## ✅ Final Checklist

- [ ] Barcha 5 ta endpoint ishlaydi
- [ ] Response format to'g'ri
- [ ] Error handling ishlaydi
- [ ] Authorization talab qilinadi
- [ ] Frontend komponent API'ga ulanadi
- [ ] Loading state ko'rinadi
- [ ] Error message ko'rinadi
- [ ] CORS muammo yo'q

---

# ✅ IMPLEMENTATSIYA CHECKLIST

## 🎯 Bajarilgan Ishlar

### Backend Changes ✅
- [x] **TaskRepository.java** - 4 ta yangi query method qo'shildi
  - `findByLessonId(UUID lessonId)`
  - `findByTeacherId(UUID teacherId)`
  - `findByApprovedFalse()`
  - `findByLessonIdAndApprovedFalse(UUID lessonId)`

- [x] **TaskService.java** - 4 ta yangi service method qo'shildi
  - `getTasksByLesson(UUID lessonId)`
  - `getTasksByTeacher(UUID teacherId)`
  - `getUnapprovedTasksByLesson(UUID lessonId)`
  - `getTaskById(UUID taskId)`

- [x] **TaskController.java** - 4 ta yangi GET endpoint qo'shildi
  - `GET /api/v1/task/lesson/{lessonId}`
  - `GET /api/v1/task/{taskId}`
  - `GET /api/v1/task/teacher/{teacherId}`
  - `GET /api/v1/task/lesson/{lessonId}/unapproved`
  - Mavjud: `POST /api/v1/task/save/{userId}/{lessonId}` (yangilandi)

- [x] **TaskDTO.java** - Enhanced DTO
  - Response field'lari qo'shildi

- [x] **@CrossOrigin** annotation'i qo'shildi

---

### 🚀 Frontend Integration Qo'llanmasi

#### Step 1: Custom Hook Yaratish
**Fayl:** `src/hooks/useTaskService.js`
- [ ] Hook yaratildi

#### Step 2: Komponenti Yaratish
**Fayl:** `src/components/LessonTaskList.jsx`
- [ ] Component yaratildi

#### Step 3: Router'da Ro'yxatdan O'tkazish
**Fayl:** `src/App.jsx` yoki `src/routes/index.js`
- [ ] Route qo'shildi

#### Step 4: Environment Variable'larni O'rnatish
**Fayl:** `.env`
- [ ] REACT_APP_API_URL o'rnatildi

---

## 🧪 Testing Steps

### Postman Testing
- [ ] Postman'ni o'rnating
- [ ] `Postman_Collection.json`'ni import qiling
- [ ] Environment variable'larni sozlang
- [ ] Har bir endpoint'ni test qiling

### Frontend Testing
- [ ] React komponenti yaratish
- [ ] Hook'larni ishlatish
- [ ] API so'rovlarini network tab'da tekshirish
- [ ] Error handling'ni test qilish

---

## 📞 Quick Reference

### API Call Template
```javascript
const response = await fetch(
  'http://localhost:8080/api/v1/task/lesson/123e4567-e89b-12d3-a456-426614174000',
  {
    method: 'GET',
    headers: {
      'Authorization': localStorage.getItem('access_token'),
      'Content-Type': 'application/json'
    }
  }
);

const tasks = await response.json();
console.log(tasks);
```

---

# 🐛 TROUBLESHOOTING

## Problem 1: 401 Unauthorized
**Sabab:** Token'ni o'tkazmagansiz
**Yechim:**
```javascript
const token = localStorage.getItem('access_token');
if (!token) {
  console.log('Token topilmadi - login qiling');
}
// To'g'ri header o'tkazish
fetch(url, { headers: { Authorization: token } });
```

---

## Problem 2: CORS Error
**Sabab:** Frontend va Backend'ning URL'lari boshqacha
**Yechim:**
```javascript
// Frontend .env'da to'g'ri URL
REACT_APP_API_URL=http://localhost:8080
```

---

## Problem 3: 404 Not Found
**Sabab:** ID noto'g'ri yoki mavjud emas
**Yechim:**
```javascript
// Console'da ID'ni tekshiring
console.log('lessonId:', lessonId);
// Valid UUID format'da ekanligini tekshiring
```

---

## Problem 4: Vazifalar yuklanmaydi
**Sabab:** API'ga ulanmayotganligiz
**Yechim:**
1. Network tab'da so'rovni ko'ring
2. Backend ishlayotganini tekshiring
3. Console'dagi error'larni o'qing

---

## Problem 5: "Unused import statement" warning
**Sabab:** Import qilingan lekin ishlatilmagan class
**Yechim:**
```java
// Unused import'larni olib tashlash
// Misol: import com.example.backend.DTO.TaskDTO;
```

---

# 📊 API Endpoints Xulosa

| # | Method | Endpoint | Tavsif | Status |
|---|--------|----------|--------|--------|
| 1 | GET | `/api/v1/task/lesson/{lessonId}` | Dars bo'yicha barcha vazifalar | ✅ |
| 2 | GET | `/api/v1/task/{taskId}` | Bitta vaziafaning detallar | ✅ |
| 3 | GET | `/api/v1/task/teacher/{teacherId}` | O'qituvchi bo'yicha vazifalar | ✅ |
| 4 | GET | `/api/v1/task/lesson/{lessonId}/unapproved` | Tasdiq kutmoqda bo'lgan vazifalar | ✅ |
| 5 | POST | `/api/v1/task/save/{userId}/{lessonId}` | Yangi vazifa yaratish | ✅ |

---

# 🔑 TaskType Enums

```
TEST       - Test shaklidagi vazifa
SELF       - Mustaqil ish
MATCHING   - Moslashtirish o'yini
CROSSWORD  - Krossord jumboq
```

---

# 🎯 NEXT STEPS

1. **QUICK_START** bo'limni o'qing (5 min)
2. **Postman Collection**'ni import qiling
3. **API endpoints**'larni test qiling
4. **Frontend** komponentlarni qo'shish
5. **Router** setup qiling
6. **.env** sozlash
7. **Frontend** testing qilish

---

# 📚 File Locations

Barcha dokumentatsiya fayllar joylashgan joylar:
- `C:\Users\user\Documents\GitHub\startup\back\STUDENT_TASKS_API_COMPLETE_GUIDE.md` - Bu fayl (TO'LIQ DOKUMENTATSIYA)
- `C:\Users\user\Documents\GitHub\startup\back\Postman_Collection.json` - API test collection

---

# ✨ SUMMARY

**Backend:** ✅ COMPLETE
- 5 ta GET endpoint
- 1 ta POST endpoint
- TaskService/Repository/Controller/DTO updated
- CORS enabled

**Documentation:** ✅ COMPLETE
- Complete guide (bu fayl)
- Frontend examples
- Testing guide
- Implementation checklist

**Frontend:** ⏳ READY FOR IMPLEMENTATION
- Custom hooks ready
- Components ready
- Examples provided

**Testing:** ✅ GUIDE PROVIDED
- Postman collection
- Test cases
- Debugging tips

---

**🎉 Hammasi tayyor! Endi Frontend'da implement qiling!**

---

**Yaratilgan:** 2026-04-12  
**Status:** ✅ COMPLETE
**Versiya:** 1.0

