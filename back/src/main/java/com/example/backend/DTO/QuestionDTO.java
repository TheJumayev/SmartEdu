package com.example.backend.DTO;

import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {

    private String question;

    // OPTIONAL (важно!)
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;

    // 🔥 для MATCHING / TABLE / CROSSWORD
    private String left;
    private String right;

    private List<String> options;
}