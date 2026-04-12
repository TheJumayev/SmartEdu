package com.example.backend.Controller;

import com.example.backend.DTO.TaskDTO;
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

    /**
     * Yangi vaziafa yaratish
     * POST /api/v1/task/save/{userId}/{lessonId}
     */
    @PostMapping("/save/{userId}/{lessonId}")
    public ResponseEntity<Task> save(
            @PathVariable UUID userId,
            @PathVariable UUID lessonId,
            @RequestBody Task task
    ) {
        Task savedTask = taskService.save(task, userId, lessonId);
        return ResponseEntity.ok(savedTask);
    }

    /**
     * Dars bo'yicha barcha vazifalarni olish
     * GET /api/v1/task/lesson/{lessonId}
     *
     * @param lessonId - Darsning ID'si
     * @return Dars bo'yicha barcha vazifalar ro'yxati
     */
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Task>> getTasksByLesson(@PathVariable UUID lessonId) {
        List<Task> tasks = taskService.getTasksByLesson(lessonId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * O'qituvchi bo'yicha barcha vazifalarni olish
     * GET /api/v1/task/teacher/{teacherId}
     *
     * @param teacherId - O'qituvchining ID'si
     * @return O'qituvchi bo'yicha barcha vazifalar ro'yxati
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Task>> getTasksByTeacher(@PathVariable UUID teacherId) {
        List<Task> tasks = taskService.getTasksByTeacher(teacherId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Dars bo'yicha tasdiqlanmagan vazifalarni olish
     * GET /api/v1/task/lesson/{lessonId}/unapproved
     *
     * @param lessonId - Darsning ID'si
     * @return Tasdiqlanmagan vazifalar ro'yxati
     */
    @GetMapping("/lesson/{lessonId}/unapproved")
    public ResponseEntity<List<Task>> getUnapprovedTasksByLesson(@PathVariable UUID lessonId) {
        List<Task> tasks = taskService.getUnapprovedTasksByLesson(lessonId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Vazifarni ID bo'yicha olish
     * GET /api/v1/task/{taskId}
     *
     * @param taskId - Vaziafaning ID'si
     * @return Vazifa ma'lumotlari
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable UUID taskId) {
        Task task = taskService.getTaskById(taskId);
        return ResponseEntity.ok(task);
    }

    // ─── Task Result endpoints ─────────────────────────────────────────────────

    /**
     * Talaba natijasini saqlash
     * POST /api/v1/task/result
     *
     * Body: { taskId, studentId, type, correct, total, percent, answers? }
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
                // answers may arrive as Map from JSON — convert to simple json string
                Object answers = body.get("answers");
                answersJson = answers.toString(); // fallback; works for Map.toString()
                // Use Jackson if available for proper JSON
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    answersJson = mapper.writeValueAsString(answers);
                } catch (Exception ignored) {}
            }

            TaskResult result = taskService.saveResult(taskId, studentId, type, correct, total, percent, answersJson);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Talaba bu vazifani bajargan-bajarmaganligini tekshirish
     * GET /api/v1/task/result/check/{taskId}/{studentId}
     */
    @GetMapping("/result/check/{taskId}/{studentId}")
    public ResponseEntity<?> checkResult(@PathVariable UUID taskId, @PathVariable UUID studentId) {
        return taskService.checkResult(taskId, studentId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    /**
     * O'qituvchi uchun — vazifa bo'yicha barcha talabalar natijalari
     * GET /api/v1/task/results/task/{taskId}
     */
    @GetMapping("/results/task/{taskId}")
    public ResponseEntity<List<TaskResult>> getResultsByTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskService.getResultsByTask(taskId));
    }
}
