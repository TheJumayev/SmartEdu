package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskQuestion {

    @Id
    @GeneratedValue
    private UUID id;

    private String question;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;

    // for MATCHING type
    @Column(name = "left_side")
    private String left;

    @Column(name = "right_side")
    private String right;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Task task;
}