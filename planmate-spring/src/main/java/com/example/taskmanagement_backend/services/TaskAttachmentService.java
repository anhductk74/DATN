package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.CreateTaskAttachmentRequestDto;
import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.UpdateTaskAttachmentRequestDto;
import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.TaskAttachmentResponseDto;
import com.example.taskmanagement_backend.entities.Task;
import com.example.taskmanagement_backend.entities.TaskAttachment;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.repositories.TaskAttachmentJpaRepository;
import com.example.taskmanagement_backend.repositories.TaskJpaRepository;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskAttachmentService {

    @Autowired
    private TaskAttachmentJpaRepository attachmentRepo;

    @Autowired
    private TaskJpaRepository taskRepo;

    @Autowired
    private UserJpaRepository userRepo;

    public TaskAttachmentResponseDto create(CreateTaskAttachmentRequestDto dto) {
        Task task = taskRepo.findById(dto.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        User uploader = userRepo.findById(dto.getUploadedById())
                .orElseThrow(() -> new EntityNotFoundException("Uploader not found"));

        TaskAttachment attachment = TaskAttachment.builder()
                .task(task)
                .fileUrl(dto.getFileUrl())
                .uploadedBy(uploader)
                .createdAt(LocalDateTime.now())
                .build();

        return toDto(attachmentRepo.save(attachment));
    }

    public TaskAttachmentResponseDto update(Long id, UpdateTaskAttachmentRequestDto dto) {
        TaskAttachment attachment = attachmentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));

        attachment.setFileUrl(dto.getFileUrl());

        return toDto(attachmentRepo.save(attachment));
    }

    public TaskAttachmentResponseDto getById(Long id) {
        return attachmentRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));
    }

    public List<TaskAttachmentResponseDto> getAll() {
        return attachmentRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        if (!attachmentRepo.existsById(id)) {
            throw new EntityNotFoundException("Attachment not found");
        }
        attachmentRepo.deleteById(id);
    }

    private TaskAttachmentResponseDto toDto(TaskAttachment attachment) {
        return TaskAttachmentResponseDto.builder()
                .id(attachment.getId())
                .taskId(attachment.getTask().getId())
                .fileUrl(attachment.getFileUrl())
                .uploadedById(attachment.getUploadedBy().getId())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    public List<TaskAttachmentResponseDto> getByTaskId(Long taskId) {
        return attachmentRepo.findByTaskId(taskId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

}
