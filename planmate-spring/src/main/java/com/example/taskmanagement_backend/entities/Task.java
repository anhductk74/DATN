package com.example.taskmanagement_backend.entities;

import com.example.taskmanagement_backend.enums.TaskPriority;
import com.example.taskmanagement_backend.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Column(name = "status_key")
    private String statusKey; // References user's custom status configuration

    @Column(name = "priority_key")
    private String priorityKey; // References user's custom priority configuration

    @Column(name = "start_date")
    private LocalDate startDate;


    private LocalDate deadline;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Task không bắt buộc phải thuộc team
    @ManyToOne(optional = true)
    @JoinColumn(name = "team_id", foreignKey = @ForeignKey(name = "fk_task_team"))
    private Team team;

    // Task không bắt buộc phải thuộc project
    @ManyToOne(optional = true)
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "fk_task_project"))
    private Project project;

    // Creator là bắt buộc
    @ManyToOne(optional = true)
    @JoinColumn(name = "creator_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_creator"))
    private User creator;

    @Builder.Default
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskAssignee> assignees = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<TaskChecklist> checklists = new HashSet<>();

}
