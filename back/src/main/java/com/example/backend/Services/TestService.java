package com.example.backend.Services;

import com.example.backend.DTO.SubmitTestDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentAnswer;
import com.example.backend.Entity.Task;
import com.example.backend.Entity.TaskQuestion;
import com.example.backend.Repository.StudentAnswerRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.TaskRepo;
import com.example.backend.Services.AiServise.GeminiService;
import com.example.backend.Services.StudentPerformanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestService {

    private final TaskRepo taskRepo;
    private final StudentAnswerRepo studentAnswerRepo;
    private final StudentRepo studentRepo;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final StudentPerformanceService studentPerformanceService;

    /**
     * Check answers, persist result, optionally generate AI feedback.
     * Returns a map with: score, correct, total, breakdown, feedback.
     */
    public Map<String, Object> checkTest(SubmitTestDTO dto) {

        Task task = taskRepo.findById(dto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Vazifa topilmadi: " + dto.getTaskId()));

        List<TaskQuestion> questions = task.getQuestions() == null
                ? Collections.emptyList()
                : task.getQuestions();

        Map<String, String> studentAnswers = dto.getAnswers() != null
                ? dto.getAnswers()
                : Collections.emptyMap();

        int correct = 0;
        List<Map<String, Object>> breakdown = new ArrayList<>();
        List<String> wrongDescriptions = new ArrayList<>();

        for (TaskQuestion q : questions) {
            String qId = q.getId().toString();
            String studentAnswer = studentAnswers.get(qId);
            boolean isCorrect = q.getCorrectAnswer() != null
                    && q.getCorrectAnswer().equalsIgnoreCase(studentAnswer);
            if (isCorrect) correct++;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("questionId", qId);
            item.put("question", q.getQuestion());
            item.put("studentAnswer", studentAnswer);
            item.put("correctAnswer", q.getCorrectAnswer());
            item.put("correct", isCorrect);
            breakdown.add(item);

            if (!isCorrect) {
                wrongDescriptions.add(
                        String.format("Savol: \"%s\" | Talaba: %s | To'g'ri: %s",
                                q.getQuestion(), studentAnswer, q.getCorrectAnswer())
                );
            }
        }

        int total = questions.size();
        int score = total > 0 ? (int) Math.round((correct * 100.0) / total) : 0;

        // --- AI Feedback ---
        String feedback = null;
        if (!wrongDescriptions.isEmpty()) {
            try {
                feedback = generateFeedback(task.getTitle(), score, wrongDescriptions);
            } catch (Exception e) {
                log.warn("AI feedback generation failed: {}", e.getMessage());
            }
        }

        // --- Persist result (one per student per task) ---
        String answersJson = "{}";
        try {
            answersJson = objectMapper.writeValueAsString(studentAnswers);
        } catch (Exception ignored) {}

        // Resolve student name for teacher results view
        String studentName = studentRepo.findById(dto.getStudentId())
                .map(Student::getFullName)
                .orElse("Noma'lum talaba");

        // Upsert: if student already submitted, update
        StudentAnswer sa = studentAnswerRepo
                .findByStudentIdAndTaskId(dto.getStudentId(), dto.getTaskId())
                .orElseGet(() -> StudentAnswer.builder()
                        .studentId(dto.getStudentId())
                        .task(task)
                        .build());

        sa.setStudentName(studentName);
        sa.setScore(score);
        sa.setCorrect(correct);
        sa.setTotal(total);
        sa.setAnswersJson(answersJson);
        sa.setFeedback(feedback);
        sa.setSubmittedAt(LocalDateTime.now());
        studentAnswerRepo.save(sa);
        studentPerformanceService.updateStudentPerformance(dto.getStudentId());

        // --- Build response ---
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("correct", correct);
        result.put("total", total);
        result.put("breakdown", breakdown);
        if (feedback != null) result.put("feedback", feedback);
        return result;
    }

    /** Returns previous result for a student-task pair, or empty. */
    public Optional<StudentAnswer> getPreviousResult(UUID taskId, UUID studentId) {
        return studentAnswerRepo.findByStudentIdAndTaskId(studentId, taskId);
    }

    /** Returns all student results for a task (teacher view). */
    public List<StudentAnswer> getTaskResults(UUID taskId) {
        return studentAnswerRepo.findByTaskId(taskId);
    }

    // ── AI Feedback ──────────────────────────────────────────────────────────

    private String generateFeedback(String taskTitle, int score, List<String> wrongList) {
        StringBuilder wrongStr = new StringBuilder();
        for (int i = 0; i < wrongList.size(); i++) {
            wrongStr.append(i + 1).append(". ").append(wrongList.get(i)).append("\n");
        }

        String prompt = """
                Sen yaxshi o'qituvchisan. Talaba test topshirdi. Qisqa feedback ber (O'zbek tilida, 2-3 gap).
                
                Test: %s
                Ball: %d%%
                Noto'g'ri javoblar:
                %s
                
                Qoidalar:
                - Qaysi mavzularda bilim yetishmayotganini ayт
                - Qisqa va aniq bo'l
                - Rag'batlantiruvchi ohangda yoz
                - Faqat matnni qaytar, boshqa hech narsa yozma
                """.formatted(taskTitle, score, wrongStr);

        String raw = geminiService.generate(prompt);
        return raw != null ? raw.trim() : null;
    }
}
