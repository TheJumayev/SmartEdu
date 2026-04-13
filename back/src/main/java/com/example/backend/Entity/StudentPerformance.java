package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregated student performance statistics.
 * Updated whenever StudentAnswer is saved.
 */
@Entity
@Table(name = "student_performance",
        uniqueConstraints = @UniqueConstraint(columnNames = "student_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentPerformance {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    /** Total tasks completed */
    private int totalTasks;

    /** Average score across all tasks (0-100) */
    private double averageScore;

    /** Minimum score */
    private double minScore;

    /** Maximum score */
    private double maxScore;

    /** Last update timestamp */
    private LocalDateTime lastUpdated;
}

