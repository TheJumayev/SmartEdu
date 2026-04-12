package com.example.backend.DTO;

import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class SubmitTestDTO {

    /** The task being answered */
    private UUID taskId;

    /** UUID of the student (from localStorage, not JWT) */
    private UUID studentId;

    /** questionId (UUID as String) -> chosen option letter ("A"/"B"/"C"/"D") */
    private Map<String, String> answers;
}
