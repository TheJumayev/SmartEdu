# 📚 Student Vazifalarini Olish API Dokumentatsiyasi

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
  },
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

### Frontend Misoli (JavaScript/React)
```javascript
// axios yordamida
const getLessonTasks = async (lessonId) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${baseUrl}/api/v1/task/lesson/${lessonId}`,
      {
        headers: { 
          Authorization: token 
        }
      }
    );
    console.log('Vazifalar:', response.data);
    return response.data;
  } catch (error) {
    console.error('Vazifalarni olishda xato:', error);
  }
};

// Ishlatish
const tasks = await getLessonTasks('123e4567-e89b-12d3-a456-426614174000');
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

### Frontend Misoli
```javascript
const getUnapprovedTasks = async (lessonId) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${baseUrl}/api/v1/task/lesson/${lessonId}/unapproved`,
      {
        headers: { Authorization: token }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Tasdiqlanmagan vazifalarni olishda xato:', error);
  }
};
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
    },
    {
      "id": "q2",
      "questionText": "Qaysi biri shu'ni?",
      "type": "MATCHING",
      "options": ["X", "Y", "Z"],
      "correctAnswer": "X"
    }
  ]
}
```

### Frontend Misoli
```javascript
const getTaskById = async (taskId) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${baseUrl}/api/v1/task/${taskId}`,
      {
        headers: { Authorization: token }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Vazifa ma\'lumotlarini olishda xato:', error);
  }
};
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

### Frontend Misoli
```javascript
const createTask = async (userId, lessonId, taskData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${baseUrl}/api/v1/task/save/${userId}/${lessonId}`,
      taskData,
      {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Vazifa yaratildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Vaziafa yaratishda xato:', error);
  }
};

// Ishlatish
const newTask = await createTask(
  '223e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  {
    title: "Python Asoslari - Test",
    type: "TEST",
    approved: false,
    questions: [
      {
        questionText: "Python nima?",
        options: ["Iloji yok variant 1", "Iloji yok variant 2"],
        correctAnswer: "Iloji yok variant 1"
      }
    ]
  }
);
```

---

## 🔑 TaskType Enums
Vazifa turini belgilashda quyidagi qiymatlarni ishlating:
```
TEST         - Test shaklidagi vazifa
SELF         - Mustaqil ish
MATCHING     - Moslashtirish o'yini
CROSSWORD    - Krossord
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-600">Turi: {task.type}</p>
                <p className="text-sm text-gray-500">
                  O'qituvchi: {task.teacherName}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.approved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {task.approved ? 'Tasdiqlanmagan' : 'Tasdiqlanmagan'}
              </span>
            </div>
            <p className="mt-2 text-sm">
              Savollar: {task.questions?.length || 0} ta
            </p>
            <button
              onClick={() => console.log('Vazifani ochish:', task.id)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
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

## 🚀 Quick Start (Frontend)

```javascript
import ApiCall from '../config';

// 1. Dars bo'yicha vazifalarni olish
const tasks = await ApiCall('/api/v1/task/lesson/{lessonId}', 'GET');

// 2. Vaziafani ID'si bo'yicha olish
const task = await ApiCall('/api/v1/task/{taskId}', 'GET');

// 3. O'qituvchi vazifalarini olish
const teacherTasks = await ApiCall('/api/v1/task/teacher/{teacherId}', 'GET');

// 4. Tasdiqlanmagan vazifalarni olish
const unapproved = await ApiCall('/api/v1/task/lesson/{lessonId}/unapproved', 'GET');
```

---

## ⚠️ Xato Kodlari

| Kod | Tavsif |
|-----|--------|
| `200` | Muvaffaqiyatli so'rov |
| `400` | Xato parametrlar |
| `401` | Autentifikatsiya talab qilinadi |
| `404` | Resurs topilmadi |
| `500` | Server xatosi |

---

## 📝 Notes
- Barcha `UUID` parametrlar to'liq format'da bo'lishi kerak
- `Authorization` header'i har bir so'rovda majburiy
- Token asossiz so'rovlar `401` qaytaradi

