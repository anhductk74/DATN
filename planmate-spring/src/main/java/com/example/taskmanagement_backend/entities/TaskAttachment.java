package com.example.taskmanagement_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "task_attachments")
public class TaskAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_attachment_task"))
    private Task task;

    @Column(name = "file_url")
    private String fileUrl;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", foreignKey = @ForeignKey(name = "fk_attachment_uploader"))
    private User uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
