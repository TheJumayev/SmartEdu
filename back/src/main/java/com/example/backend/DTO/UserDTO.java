package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private UUID id;
    private String phone;
    private String password;       // faqat create/update uchun (request)
    private boolean rememberMe;
    private String name;

    /** Role ID-lari — create/update requestda ishlatiladi */
    private List<Integer> roleIds;

    /** Role nomlari — response da keladi (ROLE_TEACHER, ROLE_ADMIN ...) */
    private List<String> roleNames;
}
