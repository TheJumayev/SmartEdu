package com.example.backend.Entity;

import com.example.backend.Enums.TaskType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TaskType type; // TEST / ORAL / CROSSWORD / TABLE / MATCHING / CONTINUE_TEXT / ESSAY / PRACTICAL / DIAGRAM

    @Builder.Default
    private boolean approved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private User teacher;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "task_shared_teachers",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "teacher_id")
    )
    @JsonIgnore
    @Builder.Default
    private List<User> sharedTeachers = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaskQuestion> questions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Lesson lesson;
}