package com.example.backend.Services;

import com.example.backend.DTO.*;
import com.example.backend.Entity.*;
import com.example.backend.Enums.TaskType;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final LessonRepo lessonRepo;
    private final StudentRepo studentRepo;
    private final TaskResultRepo taskResultRepo;
    private final StudentPerformanceService studentPerformanceService;

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    /**
     * Yangi vazifa yaratish.
     * POST /api/v1/task/save/{userId}/{lessonId}
     */
    @Transactional
    public TaskResponseDTO save(TaskDTO dto, UUID userId, UUID lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Dars topilmadi: " + lessonId));
        User teacher = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("O'qituvchi topilmadi: " + userId));

        Task task = Task.builder()
                .title(dto.getTitle())
                .type(dto.getType())
                .teacher(teacher)
                .lesson(lesson)
                .approved(false)
                .build();

        // Savollar qo'shish
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            List<TaskQuestion> questions = dto.getQuestions().stream()
                    .map(q -> buildQuestion(q, task))
                    .collect(Collectors.toList());
            task.setQuestions(questions);
        }

        // SharedTeachers qo'shish
        if (dto.getSharedTeacherIds() != null && !dto.getSharedTeacherIds().isEmpty()) {
            List<User> sharedTeachers = userRepo.findAllById(dto.getSharedTeacherIds());
            task.setSharedTeachers(sharedTeachers);
        }

        Task saved = taskRepo.save(task);
        return toResponseDTO(saved);
    }

    /**
     * Dars bo'yicha barcha vazifalarni olish.
     * GET /api/v1/task/lesson/{lessonId}
     */
    public List<TaskResponseDTO> getTasksByLesson(UUID lessonId) {
        return taskRepo.findByLessonId(lessonId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * O'qituvchi yaratgan barcha vazifalarni olish.
     * GET /api/v1/task/teacher/{teacherId}
     */
    public List<TaskResponseDTO> getTasksByTeacher(UUID teacherId) {
        return taskRepo.findByTeacherId(teacherId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * O'qituvchiga ulashilgan barcha vazifalarni olish.
     * GET /api/v1/task/shared/{teacherId}
     */
    public List<TaskResponseDTO> getTasksSharedWithTeacher(UUID teacherId) {
        return taskRepo.findBySharedTeacherId(teacherId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * O'qituvchining o'zi yaratgan + unga ulashilgan barcha vazifalar.
     * GET /api/v1/task/accessible/{teacherId}
     */
    public List<TaskResponseDTO> getAllAccessibleTasks(UUID teacherId) {
        return taskRepo.findAllAccessibleByTeacher(teacherId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Dars bo'yicha tasdiqlanmagan vazifalarni olish.
     * GET /api/v1/task/lesson/{lessonId}/unapproved
     */
    public List<TaskResponseDTO> getUnapprovedTasksByLesson(UUID lessonId) {
        return taskRepo.findByLessonIdAndApprovedFalse(lessonId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Vazifani ID bo'yicha olish.
     * GET /api/v1/task/{taskId}
     */
    public TaskResponseDTO getTaskById(UUID taskId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Vazifa topilmadi: " + taskId));
        return toResponseDTO(task);
    }

    /**
     * Vazifani o'qituvchilar bilan ulashish (yoki o'zgartirish).
     * POST /api/v1/task/{taskId}/share
     * Body: { "teacherIds": ["uuid1", "uuid2"] }
     */
    @Transactional
    public TaskResponseDTO shareWithTeachers(UUID taskId, List<UUID> teacherIds) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Vazifa topilmadi: " + taskId));
        List<User> teachers = userRepo.findAllById(teacherIds);
        task.setSharedTeachers(teachers);
        return toResponseDTO(taskRepo.save(task));
    }

    /**
     * Vazifani tasdiqlash (approved = true).
     * PUT /api/v1/task/{taskId}/approve
     */
    @Transactional
    public TaskResponseDTO approveTask(UUID taskId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Vazifa topilmadi: " + taskId));
        task.setApproved(true);
        return toResponseDTO(taskRepo.save(task));
    }

    /**
     * Vazifani o'chirish.
     * DELETE /api/v1/task/{taskId}
     */
    @Transactional
    public void deleteTask(UUID taskId) {
        if (!taskRepo.existsById(taskId)) {
            throw new RuntimeException("Vazifa topilmadi: " + taskId);
        }
        taskRepo.deleteById(taskId);
    }

    // ─── Task Result ──────────────────────────────────────────────────────────

    /**
     * Talaba natijasini saqlash.
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

        TaskResult saved = taskResultRepo.save(result);
        studentPerformanceService.updateStudentPerformance(studentId);
        return saved;
    }

    /**
     * Talaba bu vazifani bajargan-bajarmaganligini tekshirish.
     * GET /api/v1/task/result/check/{taskId}/{studentId}
     */
    public Optional<TaskResult> checkResult(UUID taskId, UUID studentId) {
        return taskResultRepo.findByTaskIdAndStudentId(taskId, studentId);
    }

    /**
     * O'qituvchi uchun — vazifa bo'yicha barcha talabalar natijalari.
     * GET /api/v1/task/results/task/{taskId}
     */
    public List<TaskResult> getResultsByTask(UUID taskId) {
        return taskResultRepo.findByTaskId(taskId);
    }

    public List<TaskResult> getResultsByGroup(UUID groupId) {
        return taskResultRepo.findByStudent_GroupsId(groupId);
    }

    @Transactional(readOnly = true)
    public List<TaskResult> getResultsByStudent(UUID studentId) {
        return taskResultRepo.findByStudentIdWithDetails(studentId);
    }

    // ─── Helper methods ───────────────────────────────────────────────────────

    private TaskQuestion buildQuestion(QuestionDTO dto, Task task) {
        TaskQuestion q = new TaskQuestion();
        q.setQuestion(dto.getQuestion());
        q.setOptionA(dto.getOptionA());
        q.setOptionB(dto.getOptionB());
        q.setOptionC(dto.getOptionC());
        q.setOptionD(dto.getOptionD());
        q.setCorrectAnswer(dto.getCorrectAnswer());
        q.setLeft(dto.getLeft());
        q.setRight(dto.getRight());
        q.setTask(task);
        return q;
    }

    public TaskResponseDTO toResponseDTO(Task task) {
        // Teacher
        UserSimpleDTO teacherDTO = null;
        if (task.getTeacher() != null) {
            teacherDTO = UserSimpleDTO.builder()
                    .id(task.getTeacher().getId())
                    .name(task.getTeacher().getName())
                    .phone(task.getTeacher().getPhone())
                    .build();
        }

        // SharedTeachers
        List<UserSimpleDTO> sharedDTO = new ArrayList<>();
        if (task.getSharedTeachers() != null) {
            sharedDTO = task.getSharedTeachers().stream()
                    .map(u -> UserSimpleDTO.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .phone(u.getPhone())
                            .build())
                    .collect(Collectors.toList());
        }

        // Questions
        List<QuestionDTO> questionDTOs = new ArrayList<>();
        if (task.getQuestions() != null) {
            questionDTOs = task.getQuestions().stream()
                    .map(q -> {
                        QuestionDTO qd = new QuestionDTO();
                        qd.setQuestion(q.getQuestion());
                        qd.setOptionA(q.getOptionA());
                        qd.setOptionB(q.getOptionB());
                        qd.setOptionC(q.getOptionC());
                        qd.setOptionD(q.getOptionD());
                        qd.setCorrectAnswer(q.getCorrectAnswer());
                        qd.setLeft(q.getLeft());
                        qd.setRight(q.getRight());
                        return qd;
                    })
                    .collect(Collectors.toList());
        }

        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .type(task.getType())
                .approved(task.isApproved())
                .teacher(teacherDTO)
                .lessonId(task.getLesson() != null ? task.getLesson().getId() : null)
                .lessonName(task.getLesson() != null ? task.getLesson().getName() : null)
                .sharedTeachers(sharedDTO)
                .questions(questionDTOs)
                .build();
    }
}