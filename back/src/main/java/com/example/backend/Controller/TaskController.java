package com.example.backend.Controller;

import com.example.backend.DTO.StudentResultDTO;
import com.example.backend.DTO.TaskDTO;
import com.example.backend.DTO.TaskResponseDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Task;
import com.example.backend.Entity.TaskResult;
import com.example.backend.Services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/task")
@RequiredArgsConstructor
@CrossOrigin
public class TaskController {

    private final TaskService taskService;

    // ─── Task CRUD ────────────────────────────────────────────────────────────

    /**
     * Yangi vazifa yaratish.
     * POST /api/v1/task/save/{userId}/{lessonId}
     *
     * Body (JSON):
     * {
     *   "title": "Algebra 1-mavzu test",
     *   "type": "TEST",
     *   "sharedTeacherIds": ["uuid1", "uuid2"],   // ixtiyoriy
     *   "questions": [
     *     {
     *       "question": "2+2=?",
     *       "optionA": "3", "optionB": "4", "optionC": "5", "optionD": "6",
     *       "correctAnswer": "B"
     *     }
     *   ]
     * }
     */
    @PostMapping("/save/{userId}/{lessonId}")
    public ResponseEntity<TaskResponseDTO> save(
            @PathVariable UUID userId,
            @PathVariable UUID lessonId,
            @RequestBody TaskDTO dto
    ) {
        TaskResponseDTO saved = taskService.save(dto, userId, lessonId);
        return ResponseEntity.ok(saved);
    }

    /**
     * Vazifani ID bo'yicha olish.
     * GET /api/v1/task/{taskId}
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    /**
     * Dars bo'yicha barcha vazifalarni olish.
     * GET /api/v1/task/lesson/{lessonId}
     */
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(taskService.getTasksByLesson(lessonId));
    }

    /**
     * O'qituvchi yaratgan barcha vazifalarni olish.
     * GET /api/v1/task/teacher/{teacherId}
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByTeacher(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(taskService.getTasksByTeacher(teacherId));
    }

    /**
     * O'qituvchiga ulashilgan barcha vazifalarni olish.
     * GET /api/v1/task/shared/{teacherId}
     */
    @GetMapping("/shared/{teacherId}")
    public ResponseEntity<List<TaskResponseDTO>> getSharedTasks(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(taskService.getTasksSharedWithTeacher(teacherId));
    }

    /**
     * O'qituvchi uchun barcha ko'rinadigan vazifalar (o'zi yaratgan + unga ulashilgan).
     * GET /api/v1/task/accessible/{teacherId}
     */
    @GetMapping("/accessible/{teacherId}")
    public ResponseEntity<List<TaskResponseDTO>> getAllAccessibleTasks(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(taskService.getAllAccessibleTasks(teacherId));
    }

    /**
     * Dars bo'yicha tasdiqlanmagan vazifalarni olish.
     * GET /api/v1/task/lesson/{lessonId}/unapproved
     */
    @GetMapping("/lesson/{lessonId}/unapproved")
    public ResponseEntity<List<TaskResponseDTO>> getUnapprovedTasksByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(taskService.getUnapprovedTasksByLesson(lessonId));
    }

    /**
     * Vazifani o'qituvchilar bilan ulashish (replace).
     * POST /api/v1/task/{taskId}/share
     *
     * Body: { "teacherIds": ["uuid1", "uuid2"] }
     */
    @PostMapping("/{taskId}/share")
    public ResponseEntity<TaskResponseDTO> shareWithTeachers(
            @PathVariable UUID taskId,
            @RequestBody Map<String, List<UUID>> body
    ) {
        List<UUID> teacherIds = body.get("teacherIds");
        if (teacherIds == null || teacherIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(taskService.shareWithTeachers(taskId, teacherIds));
    }

    /**
     * Vazifani tasdiqlash.
     * PUT /api/v1/task/{taskId}/approve
     */
    @PutMapping("/{taskId}/approve")
    public ResponseEntity<TaskResponseDTO> approveTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskService.approveTask(taskId));
    }

    /**
     * Vazifani o'chirish.
     * DELETE /api/v1/task/{taskId}
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    // ─── Task Result ──────────────────────────────────────────────────────────

    /**
     * Talaba natijasini saqlash.
     * POST /api/v1/task/result
     *
     * Body:
     * {
     *   "taskId": "uuid",
     *   "studentId": "uuid",
     *   "type": "TEST",
     *   "correct": 8,
     *   "total": 10,
     *   "percent": 80,
     *   "answers": {"0": "A", "1": "B"}   // ixtiyoriy
     * }
     */
    @PostMapping("/result")
    public ResponseEntity<?> saveResult(@RequestBody Map<String, Object> body) {
        try {
            UUID taskId = UUID.fromString((String) body.get("taskId"));
            UUID studentId = UUID.fromString((String) body.get("studentId"));
            String type = (String) body.get("type");
            int correct = ((Number) body.get("correct")).intValue();
            int total = ((Number) body.get("total")).intValue();
            int percent = ((Number) body.get("percent")).intValue();

            String answersJson = null;
            if (body.containsKey("answers") && body.get("answers") != null) {
                Object answers = body.get("answers");
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper =
                            new com.fasterxml.jackson.databind.ObjectMapper();
                    answersJson = mapper.writeValueAsString(answers);
                } catch (Exception e) {
                    answersJson = answers.toString();
                }
            }

            TaskResult result = taskService.saveResult(
                    taskId, studentId, type, correct, total, percent, answersJson);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Talaba bu vazifani bajargan-bajarmaganligini tekshirish.
     * GET /api/v1/task/result/check/{taskId}/{studentId}
     *
     * Returns: TaskResult object yoki null
     */
    @GetMapping("/result/check/{taskId}/{studentId}")
    public ResponseEntity<?> checkResult(
            @PathVariable UUID taskId,
            @PathVariable UUID studentId
    ) {
        return taskService.checkResult(taskId, studentId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    /**
     * O'qituvchi uchun — vazifa bo'yicha barcha talabalar natijalari.
     * GET /api/v1/task/results/task/{taskId}
     */
    @GetMapping("/results/task/{taskId}")
    public ResponseEntity<List<StudentResultDTO>> getResultsByTask(@PathVariable UUID taskId) {
        List<TaskResult> list = taskService.getResultsByTask(taskId);
        List<StudentResultDTO> dtos = list.stream().map(r -> {
            Student st = r.getStudent();
            Groups g = st != null ? st.getGroups() : null;
            return StudentResultDTO.builder()
                    .id(r.getId())
                    .studentId(st != null ? st.getId() : null)
                    .studentName(st != null ? st.getFullName() : null)
                    .score(r.getPercent())
                    .correct(r.getCorrect())
                    .total(r.getTotal())
                    .submittedAt(r.getCompletedAt())
                    .groupId(g != null ? g.getId() : null)
                    .groupName(g != null ? g.getName() : null)
                    .type(r.getType() != null ? r.getType().name() : null)
                    .build();
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Talaba uchun — o'zining barcha natijalari.
     * GET /api/v1/task/results/student/{studentId}
     */
    @GetMapping("/results/student/{studentId}")
    public ResponseEntity<List<StudentResultDTO>> getResultsByStudent(@PathVariable UUID studentId) {
        List<TaskResult> list = taskService.getResultsByStudent(studentId);
        List<StudentResultDTO> dtos = list.stream().map(r -> {
            Student st = r.getStudent();
            Groups g = st != null ? st.getGroups() : null;
            Task t = r.getTask();
            com.example.backend.Entity.Lesson lesson = t != null ? t.getLesson() : null;
            com.example.backend.Entity.User teacher = t != null ? t.getTeacher() : null;
            return StudentResultDTO.builder()
                    .id(r.getId())
                    .studentId(st != null ? st.getId() : null)
                    .studentName(st != null ? st.getFullName() : null)
                    .taskId(t != null ? t.getId() : null)
                    .taskTitle(t != null ? t.getTitle() : null)
                    .lessonName(lesson != null ? lesson.getName() : null)
                    .teacherName(teacher != null ? teacher.getName() : null)
                    .score(r.getPercent())
                    .correct(r.getCorrect())
                    .total(r.getTotal())
                    .submittedAt(r.getCompletedAt())
                    .groupId(g != null ? g.getId() : null)
                    .groupName(g != null ? g.getName() : null)
                    .type(r.getType() != null ? r.getType().name() : null)
                    .build();
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * O'qituvchi uchun — guruh bo'yicha barcha talabalar natijalari.
     * GET /api/v1/task/results/group/{groupId}
     */
    @GetMapping("/results/group/{groupId}")
    public ResponseEntity<List<StudentResultDTO>> getResultsByGroup(@PathVariable UUID groupId) {
        List<TaskResult> list = taskService.getResultsByGroup(groupId);
        List<StudentResultDTO> dtos = list.stream().map(r -> {
            Student st = r.getStudent();
            Groups g = st != null ? st.getGroups() : null;
            return StudentResultDTO.builder()
                    .id(r.getId())
                    .studentId(st != null ? st.getId() : null)
                    .studentName(st != null ? st.getFullName() : null)
                    .score(r.getPercent())
                    .correct(r.getCorrect())
                    .total(r.getTotal())
                    .submittedAt(r.getCompletedAt())
                    .groupId(g != null ? g.getId() : null)
                    .groupName(g != null ? g.getName() : null)
                    .type(r.getType() != null ? r.getType().name() : null)
                    .build();
        }).toList();
        return ResponseEntity.ok(dtos);
    }
}
