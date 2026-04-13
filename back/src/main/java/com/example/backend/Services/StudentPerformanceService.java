package com.example.backend.Services;

import com.example.backend.Entity.StudentAnswer;
import com.example.backend.Entity.StudentPerformance;
import com.example.backend.Entity.TaskResult;
import com.example.backend.Repository.StudentAnswerRepo;
import com.example.backend.Repository.StudentPerformanceRepo;
import com.example.backend.Repository.TaskResultRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentPerformanceService {

    private final StudentPerformanceRepo studentPerformanceRepo;
    private final StudentAnswerRepo studentAnswerRepo;
    private final TaskResultRepo taskResultRepo;

    /**
     * Update performance stats for a single student.
     * Called whenever StudentAnswer is saved.
     */
    @Transactional
    public void updateStudentPerformance(UUID studentId) {
        // Aggregate from both StudentAnswer (TEST type) and TaskResult (all other types)
        List<StudentAnswer> answers = studentAnswerRepo.findByStudentId(studentId);
        List<TaskResult> taskResults = taskResultRepo.findByStudentId(studentId);

        int totalCount = answers.size() + taskResults.size();
        if (totalCount == 0) {
            log.debug("No performance data found for student: {}", studentId);
            return;
        }

        double totalScore = 0;
        double minScore = Double.MAX_VALUE;
        double maxScore = Double.MIN_VALUE;

        for (StudentAnswer answer : answers) {
            double score = answer.getScore();
            totalScore += score;
            minScore = Math.min(minScore, score);
            maxScore = Math.max(maxScore, score);
        }
        for (TaskResult tr : taskResults) {
            double score = tr.getPercent();
            totalScore += score;
            minScore = Math.min(minScore, score);
            maxScore = Math.max(maxScore, score);
        }

        double averageScore = totalScore / totalCount;
        int totalTasks = totalCount;

        Optional<StudentPerformance> existing = studentPerformanceRepo.findByStudentId(studentId);

        StudentPerformance performance;
        if (existing.isPresent()) {
            performance = existing.get();
            performance.setTotalTasks(totalTasks);
            performance.setAverageScore(averageScore);
            performance.setMinScore(minScore);
            performance.setMaxScore(maxScore);
            performance.setLastUpdated(LocalDateTime.now());
        } else {
            performance = StudentPerformance.builder()
                    .studentId(studentId)
                    .totalTasks(totalTasks)
                    .averageScore(averageScore)
                    .minScore(minScore)
                    .maxScore(maxScore)
                    .lastUpdated(LocalDateTime.now())
                    .build();
        }

        studentPerformanceRepo.save(performance);
        log.info("Updated StudentPerformance for {}: avgScore={}, totalTasks={}",
                studentId, averageScore, answers.size());
    }

    /**
     * Recalculate performance for all students.
     * Can be scheduled or called manually.
     */
    @Transactional
    public void updateAllStudentsPerformance() {
        List<StudentAnswer> allAnswers = studentAnswerRepo.findAll();

        if (allAnswers.isEmpty()) {
            log.info("No StudentAnswers found, skipping bulk update");
            return;
        }

        // Group by studentId
        allAnswers.stream()
                .map(StudentAnswer::getStudentId)
                .distinct()
                .forEach(this::updateStudentPerformance);

        log.info("Updated performance for all students");
    }

    /**
     * Scheduled job: recalculate all stats every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void scheduledPerformanceUpdate() {
        log.info("Starting scheduled StudentPerformance update...");
        try {
            updateAllStudentsPerformance();
            log.info("Scheduled update completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled performance update", e);
        }
    }
}

