package com.example.backend.Services;

import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.Task;
import com.example.backend.Entity.TaskResult;
import com.example.backend.Entity.User;
import com.example.backend.Enums.TaskType;
import com.example.backend.Repository.LessonRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.TaskRepo;
import com.example.backend.Repository.TaskResultRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final LessonRepo lessonRepo;
    private final StudentRepo studentRepo;
    private final TaskResultRepo taskResultRepo;

    public Task save(Task task, UUID userId, UUID lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found"));
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        task.setLesson(lesson);
        task.setTeacher(user);
        if (task.getQuestions() != null) {
            task.getQuestions().forEach(q -> q.setTask(task));
        }
        return taskRepo.save(task);
    }

    /**
     * Dars bo'yicha barcha vazifalarni olish
     */
    public List<Task> getTasksByLesson(UUID lessonId) {
        return taskRepo.findByLessonId(lessonId);
    }

    /**
     * O'qituvchi bo'yicha barcha vazifalarni olish
     */
    public List<Task> getTasksByTeacher(UUID teacherId) {
        return taskRepo.findByTeacherId(teacherId);
    }

    /**
     * Dars bo'yicha tasdiqlanmagan vazifalarni olish
     */
    public List<Task> getUnapprovedTasksByLesson(UUID lessonId) {
        return taskRepo.findByLessonIdAndApprovedFalse(lessonId);
    }

    /**
     * Vazifarni ID bo'yicha olish
     */
    public Task getTaskById(UUID taskId) {
        return taskRepo.findById(taskId).orElseThrow(() ->
            new RuntimeException("Vazifa topilmadi: " + taskId));
    }

    // ─── Task Result ───────────────────────────────────────────────────────────

    /**
     * Talaba natijasini saqlash (yoki mavjud bo'lsa xatolik qaytarish)
     * POST /api/v1/task/result
     */
    public TaskResult saveResult(UUID taskId, UUID studentId, String type,
                                  int correct, int total, int percent,
                                  String answersJson) {
        if (taskResultRepo.existsByTaskIdAndStudentId(taskId, studentId)) {
            throw new RuntimeException("Talaba bu vazifani allaqachon bajargan");
        }
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Vazifa topilmadi: " + taskId));
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Talaba topilmadi: " + studentId));

        TaskResult result = TaskResult.builder()
                .task(task)
                .student(student)
                .type(TaskType.valueOf(type))
                .correct(correct)
                .total(total)
                .percent(percent)
                .completedAt(LocalDateTime.now())
                .answersJson(answersJson)
                .build();

        return taskResultRepo.save(result);
    }

    /**
     * Talaba bu vazifani bajargan-bajarmaganligini tekshirish
     * GET /api/v1/task/result/check/{taskId}/{studentId}
     */
    public Optional<TaskResult> checkResult(UUID taskId, UUID studentId) {
        return taskResultRepo.findByTaskIdAndStudentId(taskId, studentId);
    }
}