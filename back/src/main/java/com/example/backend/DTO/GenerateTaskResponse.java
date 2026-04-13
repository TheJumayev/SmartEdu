package com.example.backend.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GenerateTaskResponse {
    private String title;
    private List<QuestionDTO> questions;

    // TABLE type fields
    private List<String> columns;
    private List<List<String>> rows;
    private List<String> options;   // selectable answer pool for TABLE
    private List<List<String>> answers;
}