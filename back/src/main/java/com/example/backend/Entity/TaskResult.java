package com.example.backend.Entity;

import com.example.backend.Enums.TaskType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_result",
        uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "student_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResult {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    private TaskType type;

    private int correct;
    private int total;
    private int percent;

    private LocalDateTime completedAt;

    /** JSON string of student answers (for TEST type), e.g. {"0":"A","1":"C"} */
    @Column(columnDefinition = "TEXT")
    private String answersJson;
}
