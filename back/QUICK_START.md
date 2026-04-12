# 🚀 Student Vazifalarini Olish - Quick Start Guide

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

**cURL Misoli:**
```bash
curl -X POST "http://localhost:8080/api/v1/task/save/223e4567-e89b-12d3-a456-426614174001/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Asoslari - Test",
    "type": "TEST",
    "approved": false
  }'
```

---

## 🎯 Javobning Tuzilishi

```json
{
  "id": "uuid-string",
  "title": "Vazifa sarlavhasi",
  "type": "TEST",           // TEST, SELF, MATCHING, CROSSWORD
  "approved": false,        // true yoki false
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

## ✅ Integration Checklist

- [ ] `/api/v1/task/lesson/{lessonId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/{taskId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/teacher/{teacherId}` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/lesson/{lessonId}/unapproved` - GET endpoint sinov qilindi
- [ ] `/api/v1/task/save/{userId}/{lessonId}` - POST endpoint sinov qilindi
- [ ] Frontend komponenti yaratildi
- [ ] Styling o'rnatildi
- [ ] Error handling qo'shildi

---

## 📚 Ko'proq Ma'lumot

Batafsil dokumentatsiya uchun quyidagi fayllarni o'qing:
- **`TASK_API_DOCUMENTATION.md`** - To'liq API dokumentatsiyasi
- **`FRONTEND_EXAMPLES.md`** - Frontend misollari va komponentlari
- **`Postman_Collection.json`** - Postman collection (import qilib sinov qiling)

---

## 🆘 Muammo Yuz Bersa

### Masala: "401 Unauthorized"
**Yechim:** Token'ni to'g'ri o'tkazganizni tekshiring
```javascript
const token = localStorage.getItem('access_token');
if (!token) {
  console.log('Token topilmadi - login qiling');
}
```

### Masala: "404 Not Found"
**Yechim:** ID'larni to'g'ri parametrda o'tkazganizni tekshiring
```javascript
// Noto'g'ri:
fetch(`/api/v1/task/${undefined}`);

// To'g'ri:
fetch(`/api/v1/task/${validTaskId}`);
```

### Masala: Cors xatosi
**Yechim:** Backend'da `@CrossOrigin` annotation'i bor ekanligini tekshiring

---

## 🎓 Tavsiya

1. Avval **Postman** yoki **Thunder Client** bilan API sinov qiling
2. So'ngra **Frontend'** ga birikitring
3. **Error handling** va **loading states** ni qo'shishni unutmang
4. Response ma'lumotlarini **console.log** qilib tekshiring

---

## 📞 API Base URL

Development:
```
http://localhost:8080
```

Production:
```
https://your-domain.com
```

---

**✅ Tayyor! Endi frontend'da vazifalarni ko'rish mumkin!** 🎉

