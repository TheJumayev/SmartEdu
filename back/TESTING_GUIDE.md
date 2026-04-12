# 🧪 Testing Guide - Student Vazifalarini Olish API

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

### Step 2: Router'da Ro'yxatdan O'tkazish

```javascript
// App.jsx yoki index.jsx
import TestTasks from './pages/TestTasks';

<Route path="/test-tasks" element={<TestTasks />} />
```

### Step 3: Brauzer Konsolini Tekshiring

1. `http://localhost:3000/test-tasks` ga boring
2. F12 → **Console** tab'ini ochish
3. "✅ Vazifalar yuklandi" messejini qidiring

---

## 🔧 Network Tab'da Tekshirish

### Step 1: Developer Tools'ni Ochish
- **F12** yoki **Ctrl+Shift+I**
- **Network** tab'ini tanlang

### Step 2: Sahifani Yangilash
- **Ctrl+R** yoki **F5**
- Barcha so'rovlarni ko'ring

### Step 3: `/api/v1/task/lesson/` so'rovni tanlang
- **Headers** - Barcha ma'lumotlarni ko'ring
- **Preview** - JSON response'ni ko'ring
- **Response** - Raw JSON'ni ko'ring

---

## 📊 Response Validation Checklist

### Vazifa Objekti Uchun:
```javascript
✅ task.id - UUID format
✅ task.title - String
✅ task.type - TEST/SELF/MATCHING/CROSSWORD
✅ task.approved - Boolean
✅ task.teacherName - String (O'qituvchi ismi)
✅ task.teacherId - UUID
✅ task.lessonName - String
✅ task.questions - Array
   ✅ question.question - String
   ✅ question.optionA/B/C/D - String
   ✅ question.correctAnswer - String
```

---

## 🚨 Error Handling Test

### Test: 404 Not Found
```bash
# Mavjud bo'lmagan ID bilan
curl -X GET "http://localhost:8080/api/v1/task/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: token"

# Expected: 404 NOT FOUND
```

### Test: 401 Unauthorized
```bash
# Token'siz
curl -X GET "http://localhost:8080/api/v1/task/lesson/123e4567-e89b-12d3-a456-426614174000"

# Expected: 401 UNAUTHORIZED
```

### Test: 400 Bad Request
```bash
# Noto'g'ri format (POST)
curl -X POST "http://localhost:8080/api/v1/task/save/invalid-id/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: token" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'

# Expected: 400 BAD REQUEST
```

---

## 🎯 Avtomated Testing (JavaScript)

```javascript
// tests/taskApi.test.js
const API_URL = 'http://localhost:8080/api/v1/task';

describe('Task API', () => {
  const token = 'YOUR_TEST_TOKEN';
  const lessonId = '123e4567-e89b-12d3-a456-426614174000';

  test('Dars bo\'yicha vazifalarni olish', async () => {
    const response = await fetch(`${API_URL}/lesson/${lessonId}`, {
      headers: { Authorization: token }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('title');
    expect(data[0]).toHaveProperty('type');
  });

  test('Vaziafani ID\'si bo\'yicha olish', async () => {
    const taskId = 'valid-task-id';
    const response = await fetch(`${API_URL}/${taskId}`, {
      headers: { Authorization: token }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(taskId);
  });

  test('Token'siz request 401 qaytaradi', async () => {
    const response = await fetch(`${API_URL}/lesson/${lessonId}`);
    expect(response.status).toBe(401);
  });
});
```

---

## 📝 Test Report Shabloni

```
✅ TEST RESULTS
═══════════════════════════════════

Test 1: GET /api/v1/task/lesson/{lessonId}
Status: ✅ PASS
Response Time: 245ms
Data Count: 5 tasks

Test 2: GET /api/v1/task/{taskId}
Status: ✅ PASS
Response Time: 102ms
Has questions: ✅ Yes (3 questions)

Test 3: GET /api/v1/task/teacher/{teacherId}
Status: ✅ PASS
Response Time: 150ms
Teacher tasks count: 8

Test 4: GET /api/v1/task/lesson/{lessonId}/unapproved
Status: ✅ PASS
Response Time: 98ms
Unapproved count: 2

Test 5: POST /api/v1/task/save/{userId}/{lessonId}
Status: ✅ PASS
Response Time: 320ms
Created task ID: xxx-xxx-xxx

═══════════════════════════════════
Overall: ✅ ALL TESTS PASSED
```

---

## 🔐 Security Testing

### CORS Tekshirish
```bash
# CORS header'lari mavjudmi?
curl -X OPTIONS "http://localhost:8080/api/v1/task/lesson/123" \
  -H "Origin: http://localhost:3000"

# Javobda quyidagilar bo'lishi kerak:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

### Auth Token Validation
```bash
# Expired token bilan
curl -X GET "http://localhost:8080/api/v1/task/lesson/123" \
  -H "Authorization: expired-token"

# Expected: 401 UNAUTHORIZED
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

**Tayyor! 🎉 Endi production'ga jborish mumkin!**

