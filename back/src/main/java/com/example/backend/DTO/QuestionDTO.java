package com.example.backend.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuestionDTO {

    private String question;

    // CONTINUE_TEXT: AI returns "prefix" — mapped to "question" in post-processing
    private String prefix;

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