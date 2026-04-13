package com.example.backend.Controller;

import com.example.backend.DTO.CurriculmDTO;
import com.example.backend.Entity.Curriculm;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Subjects;
import com.example.backend.Entity.User;
import com.example.backend.Repository.CurriculmRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.SubjectsRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/curriculums")
public class CurriculmController {



    private final CurriculmRepo curriculumRepo;
    private final UserRepo userRepo;
    private final SubjectsRepo subjectsRepo;
    private final GroupsRepo groupsRepo;

    @PostMapping
    public ResponseEntity<CurriculmDTO> create(@RequestBody CurriculmDTO dto) {
        List<UUID> groupIds = dto.getGroupsIds();
        if (groupIds == null || groupIds.isEmpty()) {
            groupIds = dto.getGroupsId() != null ? List.of(dto.getGroupsId()) : new ArrayList<>();
        }

        List<Groups> groupsList = new ArrayList<>();
        for (UUID gid : groupIds) {
            groupsList.add(groupsRepo.findById(gid)
                    .orElseThrow(() -> new RuntimeException("Group not found: " + gid)));
        }

        Curriculm curriculm = Curriculm.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .user(dto.getUserId() != null ? userRepo.findById(dto.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found")) : null)
                .subjects(dto.getSubjectsId() != null ? subjectsRepo.findById(dto.getSubjectsId())
                        .orElseThrow(() -> new RuntimeException("Subject not found")) : null)
                .groups(groupsList)
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        return ResponseEntity.ok(mapToCurriculmDTO(curriculumRepo.save(curriculm)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CurriculmDTO> update(
            @PathVariable UUID id,
            @RequestBody CurriculmDTO dto
    ) {
        Curriculm curriculm = curriculumRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curriculm not found with id: " + id));

        if (dto.getName() != null) curriculm.setName(dto.getName());
        if (dto.getDescription() != null) curriculm.setDescription(dto.getDescription());
        if (dto.getUserId() != null) {
            curriculm.setUser(userRepo.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found")));
        }
        if (dto.getSubjectsId() != null) {
            curriculm.setSubjects(subjectsRepo.findById(dto.getSubjectsId())
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
        }

        List<UUID> groupIds = dto.getGroupsIds();
        if (groupIds == null || groupIds.isEmpty()) {
            groupIds = dto.getGroupsId() != null ? List.of(dto.getGroupsId()) : null;
        }
        if (groupIds != null && !groupIds.isEmpty()) {
            List<Groups> groupsList = new ArrayList<>();
            for (UUID gid : groupIds) {
                groupsList.add(groupsRepo.findById(gid)
                        .orElseThrow(() -> new RuntimeException("Group not found: " + gid)));
            }
            curriculm.setGroups(groupsList);
        }

        if (dto.getCreateAt() != null) curriculm.setCreateAt(dto.getCreateAt());

        return ResponseEntity.ok(mapToCurriculmDTO(curriculumRepo.save(curriculm)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculmDTO> getById(@PathVariable UUID id) {
        Curriculm curriculm = curriculumRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curriculm not found with id: " + id));
        CurriculmDTO result = mapToCurriculmDTO(curriculm);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<CurriculmDTO>> getAll() {
        List<Curriculm> curriculms = curriculumRepo.findAll();
        List<CurriculmDTO> dtos = curriculms.stream()
                .map(this::mapToCurriculmDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable String userId) {
        if (userId == null || userId.isBlank() || "undefined".equalsIgnoreCase(userId.trim())) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Noto'g'ri userId",
                    "message", "userId UUID formatda bo'lishi kerak"
            ));
        }

        UUID parsedUserId;
        try {
            parsedUserId = UUID.fromString(userId.trim());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Noto'g'ri userId",
                    "message", "userId UUID formatda bo'lishi kerak"
            ));
        }

        Optional<User> userOptional = userRepo.findById(parsedUserId);
        if(userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOptional.get();
        List<Curriculm> curriculms = curriculumRepo.findByUserId(user.getId());
        List<CurriculmDTO> dtos = curriculms.stream()
                .map(this::mapToCurriculmDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<CurriculmDTO>> getByGroupId(@PathVariable UUID groupId) {
        List<Curriculm> curriculms = curriculumRepo.findByGroupsId(groupId);
        List<CurriculmDTO> dtos = curriculms.stream()
                .map(this::mapToCurriculmDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!curriculumRepo.existsById(id)) {
            throw new RuntimeException("Curriculm not found with id: " + id);
        }
        curriculumRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CurriculmDTO mapToCurriculmDTO(Curriculm curriculm) {
        CurriculmDTO dto = new CurriculmDTO();
        dto.setId(curriculm.getId());
        dto.setName(curriculm.getName());
        dto.setDescription(curriculm.getDescription());
        dto.setUserId(curriculm.getUser() != null ? curriculm.getUser().getId() : null);
        dto.setSubjectsId(curriculm.getSubjects() != null ? curriculm.getSubjects().getId() : null);

        List<Groups> groups = curriculm.getGroups();
        if (groups != null && !groups.isEmpty()) {
            List<UUID> ids = groups.stream().map(Groups::getId).toList();
            dto.setGroupsIds(ids);
            dto.setGroupsId(ids.get(0)); // first group for backward compat
        }
        dto.setCreateAt(curriculm.getCreateAt());
        return dto;
    }
}

