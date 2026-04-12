package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "curriculm")
@Entity
@Builder
public class Curriculm {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String description;
    @ManyToOne
    private User user;
    @ManyToOne
    private Subjects subjects;
    @ManyToMany
    @JoinTable(
            name = "curriculm_groups",
            joinColumns = @JoinColumn(name = "curriculm_id"),
            inverseJoinColumns = @JoinColumn(name = "groups_id")
    )
    private List<Groups> groups;
    private LocalDate createAt;
}
