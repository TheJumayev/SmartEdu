# Frontend Integration Guide

## 1) Base URL

- Local: `http://localhost:8080`
- API prefix: `/api/v1`

---

## 2) Об��ий формат ошибок

Backend чаще всего возвращает:

```json
{
  "error": "...",
  "message": "..."
}
```

Либо только:

```json
{
  "error": "..."
}
```

Рекомендация на фронте: всегда читать `error || message || statusText`.

---

## 3) Curriculums API

### 3.1 Получить curriculum по user

`GET /api/v1/curriculums/user/{userId}`

#### Важно
Если `userId = undefined` или не UUID, backend вернет `400`.

#### Пример ошибки

```json
{
  "error": "Noto'g'ri userId",
  "message": "userId UUID formatda bo'lishi kerak"
}
```

#### Frontend validation

```ts
export function isUuid(value?: string): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
```

```ts
if (!isUuid(userId)) {
  // не отправляем запрос
  return;
}
```

---

## 4) AI Teacher Insight API

### 4.1 Аналитика для учителя

`POST /api/v1/ai/teacher-insight`

### Request

```json
{
  "lessonId": "11111111-1111-1111-1111-111111111111",
  "students": [
    {
      "studentId": "22222222-2222-2222-2222-222222222222",
      "fullName": "Ali Valiyev",
      "score": 85,
      "completedTasks": 12,
      "averageTime": 45,
      "strengths": ["mantiqiy fikrlash"],
      "weaknesses": ["nazariy bilim"]
    }
  ]
}
```

### Response

```json
{
  "topStudents": [
    {
      "fullName": "Ali Valiyev",
      "score": 90,
      "potentialCareers": ["Dasturchi", "Data tahlilchi"],
      "reason": "Mantiqiy fikrlashi kuchli"
    }
  ],
  "lowStudents": [
    {
      "fullName": "Vali Karimov",
      "score": 45,
      "recommendations": [
        "Nazariyani oddiy misollar bilan tushuntirish",
        "Bosqichma-bosqich topshiriqlar berish",
        "Vizual materiallardan foydalanish"
      ]
    }
  ],
  "generalFeedback": "Sinfda nazariy bilimlarni mustahkamlash kerak."
}
```

### TypeScript types

```ts
export interface TeacherInsightStudentInput {
  studentId?: string;
  fullName: string;
  score?: number;
  completedTasks?: number;
  averageTime?: number;
  strengths?: string[];
  weaknesses?: string[];
}

export interface TeacherInsightRequestDTO {
  lessonId?: string;
  students: TeacherInsightStudentInput[];
}

export interface TeacherInsightResponseDTO {
  topStudents: {
    fullName: string;
    score: number;
    potentialCareers: string[];
    reason: string;
  }[];
  lowStudents: {
    fullName: string;
    score: number;
    recommendations: string[];
  }[];
  generalFeedback: string;
}
```

### fetch example

```ts
export async function getTeacherInsight(payload: TeacherInsightRequestDTO) {
  const res = await fetch('/api/v1/ai/teacher-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }

  return data as TeacherInsightResponseDTO;
}
```

---

## 5) Task Share API

### 5.1 Share task

`POST /api/v1/task/{taskId}/share`

Request:

```json
{
  "teacherIds": [
    "8f2b0d2f-9f15-4e35-b51b-1a9f2c3349c1",
    "be3dbdf1-53a4-44c5-aea7-36c5f42d4f64"
  ]
}
```

Если `teacherIds` пустой — `400`.

### 5.2 Получить shared task’и

`GET /api/v1/task/shared/{teacherId}`

### 5.3 Все доступные task’и (own + shared)

`GET /api/v1/task/accessible/{teacherId}`

---

## 6) Рекомендации для frontend

1. Никогда не отправляйте `undefined` в path params (особенно UUID).
2. Для UUID-полей делайте pre-validation до запроса.
3. Для AI endpoint показывайте loading (2-10 сек возможны).
4. На `500` добавьте кнопку retry.
5. Логируйте `requestId`/payload в dev-режиме для дебага.

---

## 7) Быстрые утилиты

```ts
export async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data as T;
}
```

