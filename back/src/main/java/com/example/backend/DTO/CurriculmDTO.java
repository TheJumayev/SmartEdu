package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CurriculmDTO {
    private UUID id;
    private String name;
    private String description;
    private UUID userId;
    private UUID subjectsId;
    private UUID groupsId;          // single (used for GET responses and PUT)
    private List<UUID> groupsIds;   // multiple (used for batch POST)
    private LocalDate createAt;
}

