# ✅ Implementation Checklist - Student Vazifalarini Olish

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

## 📚 Dokumentatsiya Yaratilgan

- [x] **README_TASKS_API.md** - Asosiy index va overview
- [x] **QUICK_START.md** - Tez boshlash qo'llanmasi (5-10 minut)
- [x] **TASK_API_DOCUMENTATION.md** - To'liq dokumentatsiya
  - Barcha endpoint'larni tavsif
  - Parameter'lar va response'lar
  - JavaScript misollari
  - Complete React komponenti
  - Config file misoli

- [x] **FRONTEND_EXAMPLES.md** - Frontend misollari
  - `useTaskService` custom hook
  - `LessonTaskList` component
  - `TaskDetail` component
  - `TaskContext` (Context API)
  - Complete page misoli
  - Axios interceptor

- [x] **TESTING_GUIDE.md** - Testing qo'llanmasi
  - Postman setup
  - 5 ta test case
  - Frontend testing
  - Error handling test
  - Automated testing misoli
  - Security testing

- [x] **Postman_Collection.json** - API collection
  - Barcha endpoint'lar
  - Pre-configured headers
  - Environment variables

---

## 📋 API Endpoints

### 1. GET /api/v1/task/lesson/{lessonId}
```
Maqsad: Dars bo'yicha barcha vazifalarni olish
Qabul: lessonId (UUID)
Javob: List<Task>
Status: 200 OK / 401 Unauthorized / 404 Not Found
```

### 2. GET /api/v1/task/{taskId}
```
Maqsad: Bitta vaziafaning to'liq detallar
Qabul: taskId (UUID)
Javob: Task
Status: 200 OK / 401 Unauthorized / 404 Not Found
```

### 3. GET /api/v1/task/teacher/{teacherId}
```
Maqsad: O'qituvchi bo'yicha vazifalar
Qabul: teacherId (UUID)
Javob: List<Task>
Status: 200 OK / 401 Unauthorized / 404 Not Found
```

### 4. GET /api/v1/task/lesson/{lessonId}/unapproved
```
Maqsad: Tasdiq kutmoqda bo'lgan vazifalar
Qabul: lessonId (UUID)
Javob: List<Task>
Status: 200 OK / 401 Unauthorized / 404 Not Found
```

### 5. POST /api/v1/task/save/{userId}/{lessonId}
```
Maqsad: Yangi vazifa yaratish
Qabul: userId, lessonId (UUID), Task JSON body
Javob: Task
Status: 200 OK / 400 Bad Request / 401 Unauthorized
```

---

## 🚀 Frontend Integration Qo'llanmasi

### Step 1: Custom Hook Yaratish
**Fayl:** `src/hooks/useTaskService.js`
```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTasksByLesson = useCallback(async (lessonId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/task/lesson/${lessonId}`,
        { headers: { Authorization: getToken() } }
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ... boshqa methodlar
};
```

### Step 2: Komponenti Yaratish
**Fayl:** `src/components/LessonTaskList.jsx`
```javascript
import { useTaskService } from '../hooks/useTaskService';

const LessonTaskList = ({ lessonId }) => {
  const { loading, error, getTasksByLesson } = useTaskService();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasksByLesson(lessonId).then(setTasks);
  }, [lessonId]);

  // JSX return...
};
```

### Step 3: Router'da Ro'yxatdan O'tkazish
**Fayl:** `src/App.jsx` yoki `src/routes/index.js`
```javascript
import StudentTasksPage from './pages/StudentTasksPage';

<Route path="/lessons/:lessonId/tasks" element={<StudentTasksPage />} />
```

### Step 4: Environment Variable'larni O'rnatish
**Fayl:** `.env`
```
REACT_APP_API_URL=http://localhost:8080
# yoki production'da:
REACT_APP_API_URL=https://api.youromain.com
```

---

## 🧪 Testing Steps

### Postman Testing
1. Postman'ni o'rnating
2. `Postman_Collection.json`'ni import qiling
3. Environment variable'larni sozlang
4. Har bir endpoint'ni test qiling

### Frontend Testing
1. React komponenti yaratish
2. Hook'larni ishlatish
3. API so'rovlarini network tab'da tekshirish
4. Error handling'ni test qilish

### Unit Testing
```javascript
// __tests__/useTaskService.test.js
describe('useTaskService', () => {
  test('getTasksByLesson should return tasks array', async () => {
    const { result } = renderHook(() => useTaskService());
    const tasks = await result.current.getTasksByLesson(lessonId);
    expect(Array.isArray(tasks)).toBe(true);
  });
});
```

---

## 🔄 Request/Response Flow

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│                                                         │
│   User clicks "Vazifalarni Ko'r" button                │
│                   ↓                                      │
│   useTaskService hook calls API                        │
│                   ↓                                      │
│   axios.get(/api/v1/task/lesson/{lessonId})            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   NETWORK (HTTP)                        │
│                                                         │
│   GET request with Authorization header                │
│   URL: http://localhost:8080/api/v1/task/lesson/123    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                 │
│                                                         │
│   TaskController.getTasksByLesson(@PathVariable)       │
│                   ↓                                      │
│   TaskService.getTasksByLesson(UUID)                   │
│                   ↓                                      │
│   TaskRepository.findByLessonId(UUID)                  │
│                   ↓                                      │
│   Database Query: SELECT * FROM task WHERE lesson_id=?│
│                   ↓                                      │
│   Return List<Task> as JSON                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│                                                         │
│   response.json() → setState(tasks)                     │
│                   ↓                                      │
│   Render TaskCard components                           │
│                   ↓                                      │
│   Display vazifalar list                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 File Structure

```
backend/
├── src/main/java/com/example/backend/
│   ├── Controller/
│   │   └── TaskController.java ✅ (yangilandi)
│   ├── Service/
│   │   └── TaskService.java ✅ (yangilandi)
│   ├── Repository/
│   │   └── TaskRepo.java ✅ (yangilandi)
│   ├── DTO/
│   │   └── TaskDTO.java ✅ (yangilandi)
│   └── Entity/
│       └── Task.java (o'zgarishmadi)
│
└── documentation/
    ├── README_TASKS_API.md ✅
    ├── QUICK_START.md ✅
    ├── TASK_API_DOCUMENTATION.md ✅
    ├── FRONTEND_EXAMPLES.md ✅
    ├── TESTING_GUIDE.md ✅
    ├── Postman_Collection.json ✅
    └── IMPLEMENTATION_CHECKLIST.md (bu fayl)
```

---

## 🔐 Security Notes

1. **Authorization** - Barcha endpoint'lar token talab qiladi
2. **CORS** - @CrossOrigin annotation qo'shildi
3. **SQL Injection** - JPA Repository ishlatilgani uchun o'rinli
4. **Rate Limiting** - Frontend'da qo'llanishi mumkin (opsional)

---

## ⚡ Performance Optimization

### Frontend'da:
```javascript
// Caching
const [tasksCache, setTasksCache] = useState({});

// Lazy Loading
const [page, setPage] = useState(1);
const tasks = allTasks.slice((page-1)*10, page*10);

// Debouncing
const debouncedSearch = useCallback(
  debounce((query) => searchTasks(query), 300),
  []
);
```

### Backend'da:
```java
// Index'lar qo'shish mumkin
@Index(name = "idx_lesson_id", columnList = "lesson_id")
public class Task {
  // ...
}

// Pagination
Page<Task> getTasks(UUID lessonId, Pageable pageable);
```

---

## 🐛 Troubleshooting

### Problem 1: 401 Unauthorized
**Sabab:** Token'ni o'tkazmagansiz
**Yechim:**
```javascript
const token = localStorage.getItem('access_token');
fetch(url, { headers: { Authorization: token } });
```

### Problem 2: CORS Error
**Sabab:** Frontend va Backend'ning URL'lari boshqacha
**Yechim:**
```javascript
// Frontend .env'da to'g'ri URL
REACT_APP_API_URL=http://localhost:8080
```

### Problem 3: 404 Not Found
**Sabab:** ID noto'g'ri yoki mavjud emas
**Yechim:**
```javascript
// Console'da ID'ni tekshiring
console.log('lessonId:', lessonId);
// Valid UUID format'da ekanligini tekshiring
```

### Problem 4: Vazifalar yuklanmaydi
**Sabab:** API'ga ulanmayotganligiz
**Yechim:**
1. Network tab'da so'rovni ko'ring
2. Backend ishlayotganini tekshiring
3. Console'dagi error'larni o'qing

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

### Response Structure
```json
{
  "id": "uuid",
  "title": "Vazifa nomi",
  "type": "TEST",
  "approved": true,
  "teacherName": "O'qituvchi",
  "teacherId": "uuid",
  "lessonName": "Dars",
  "questions": [...]
}
```

---

## ✅ Final Checklist

### Backend
- [x] API endpoint'lari yaratildi
- [x] Service methodlari yaratildi
- [x] Repository query'lari qo'shildi
- [x] DTO'lar updated
- [x] CORS sozlandi
- [x] Error handling qo'shildi

### Documentation
- [x] README yozildi
- [x] API documentation
- [x] Frontend examples
- [x] Testing guide
- [x] Postman collection

### Frontend (TODO)
- [ ] Custom hook qo'shish
- [ ] Components qo'shish
- [ ] Routes setup
- [ ] Environment variables
- [ ] Testing
- [ ] Styling

### Deployment (TODO)
- [ ] Production URL'ni sozlash
- [ ] Environment variable'larni setup qilish
- [ ] Security check
- [ ] Performance testing
- [ ] Load testing

---

**🎉 Hammasi tayyor! Endi Frontend'da integrate qiling!**

Boshqa savol bo'lsa, `FRONTEND_EXAMPLES.md` yoki `QUICK_START.md`'ni o'qing.

