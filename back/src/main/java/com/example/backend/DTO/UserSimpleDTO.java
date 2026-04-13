package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * O'qituvchi haqida minimal ma'lumot (parolsiz).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSimpleDTO {
    private UUID id;
    private String name;
    private String phone;
}

