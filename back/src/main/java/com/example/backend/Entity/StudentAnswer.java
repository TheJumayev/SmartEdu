package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_answer",
        uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "student_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnswer {

    @Id
    @GeneratedValue
    private UUID id;

    /** UUID of the Student who submitted (stored as plain column, not FK) */
    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    private int score;   // percentage 0-100
    private int correct; // number of correct answers
    private int total;   // total questions

    /** JSON: { "questionUUID": "A", ... } */
    @Column(columnDefinition = "TEXT")
    private String answersJson;

    /** Full name of the student (snapshot at submission time) */
    private String studentName;

    /** AI-generated feedback in Uzbek */
    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime submittedAt;
}
