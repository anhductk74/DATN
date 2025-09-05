package com.example.taskmanagement_backend.controllers;

import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.CreateTaskAttachmentRequestDto;
import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.UpdateTaskAttachmentRequestDto;
import com.example.taskmanagement_backend.dtos.TaskAttachmentDto.TaskAttachmentResponseDto;
import com.example.taskmanagement_backend.services.TaskAttachmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-attachments")
public class TaskAttachmentController {

    @Autowired
    private TaskAttachmentService attachmentService;

    @PostMapping
    public TaskAttachmentResponseDto create(@Valid @RequestBody CreateTaskAttachmentRequestDto dto) {
        return attachmentService.create(dto);
    }

    @PutMapping("/{id}")
    public TaskAttachmentResponseDto update(@PathVariable Long id,
                                            @Valid @RequestBody UpdateTaskAttachmentRequestDto dto) {
        return attachmentService.update(id, dto);
    }

    @GetMapping
    public List<TaskAttachmentResponseDto> getAll() {
        return attachmentService.getAll();
    }

    @GetMapping("/{id}")
    public TaskAttachmentResponseDto getById(@PathVariable Long id) {
        return attachmentService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        attachmentService.delete(id);
    }

    @GetMapping("/task/{taskId}")
    public List<TaskAttachmentResponseDto> getByTaskId(@PathVariable Long taskId) {
        return attachmentService.getByTaskId(taskId);
    }

}
