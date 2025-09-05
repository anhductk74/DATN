package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.TaskDto.CreateTaskRequestDto;
import com.example.taskmanagement_backend.dtos.TaskDto.TaskResponseDto;
import com.example.taskmanagement_backend.dtos.TaskDto.UpdateTaskRequestDto;
import com.example.taskmanagement_backend.dtos.TaskDto.MyTaskSummaryDto;
import com.example.taskmanagement_backend.entities.*;
import com.example.taskmanagement_backend.repositories.*;
import com.example.taskmanagement_backend.services.cache.TaskCacheService;
import com.example.taskmanagement_backend.services.cache.CacheMetricsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// Removed Spring Cache annotations - using Manual Redis only
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Professional Task Service with Redis Caching
 * 
 * Features:
 * - Cache-first read strategy
 * - Intelligent cache invalidation
 * - Fallback to database on cache failure
 * - Comprehensive logging and metrics
 * - Transaction support
 * 
 * @author Task Management Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceCached {

    private final TaskJpaRepository taskRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final TeamJpaRepository teamJpaRepository;
    private final TasksAssigneeJpaRepository tasksAssigneeJpaRepository;
    private final TaskCacheService taskCacheService;
    private final com.example.taskmanagement_backend.services.TaskService originalTaskService; // Fallback service
    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheMetricsService cacheMetricsService;

    /**
     * Create task with intelligent caching (Manual Redis)
     */
    @Transactional
    public TaskResponseDto createTask(CreateTaskRequestDto dto) {
        log.info("🆕 REDIS CACHE: TaskServiceCached.createTask called - title={}", dto.getTitle());
        
        try {
            // Create task using original service logic
            TaskResponseDto createdTask = originalTaskService.createTask(dto);
            
            // Cache the new task
            taskCacheService.cacheTask(createdTask.getId(), createdTask);
            log.info("✅ Cached new task: {}", createdTask.getId());
            
            // Invalidate related caches to ensure fresh data
            taskCacheService.evictRelatedCaches(null, dto.getCreatorId(), dto.getGroupId(), dto.getProjectId());
            
            log.info("✅ Task created and cached successfully: {}", createdTask.getId());
            return createdTask;
            
        } catch (Exception e) {
            log.error("❌ CACHE ERROR: Failed to create task: {}", dto.getTitle(), e);
            throw e;
        }
    }

    /**
     * Get task by ID with cache-first strategy (Manual Redis)
     */
    public TaskResponseDto getTaskById(Long id) {
        log.info("🔍 REDIS CACHE: TaskServiceCached.getTaskById called - id={}", id);
        
        try {
            // Try cache first
            TaskResponseDto cachedTask = taskCacheService.getTask(id);
            if (cachedTask != null) {
                log.info("🚀 Cache HIT for task: {}", id);
                return cachedTask;
            }
            
            // Cache miss - fallback to database
            log.info("💾 Cache MISS for task: {}, querying database", id);
            TaskResponseDto task = originalTaskService.getTaskById(id);
            
            // Cache the result
            if (task != null) {
                taskCacheService.cacheTask(id, task);
                log.info("✅ Cached task: {}", id);
            }
            
            return task;
            
        } catch (Exception e) {
            log.error("❌ CACHE ERROR: Failed to get task: {}", id, e);
            // Fallback to original service without caching
            log.warn("🔄 FALLBACK: Using original TaskService for task: {}", id);
            return originalTaskService.getTaskById(id);
        }
    }

    /**
     * Update task with cache refresh (Manual Redis)
     */
    @Transactional
    public TaskResponseDto updateTask(Long id, UpdateTaskRequestDto dto) {
        log.info("🔄 REDIS CACHE: TaskServiceCached.updateTask called - id={}", id);
        
        try {
            // Get current task for cache invalidation
            Task currentTask = taskRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Task not found"));
            
            Long oldCreatorId = currentTask.getCreator().getId();
            Long oldTeamId = currentTask.getTeam() != null ? currentTask.getTeam().getId() : null;
            Long oldProjectId = currentTask.getProject() != null ? currentTask.getProject().getId() : null;
            
            // ✅ FIX: Get all assignee IDs for cache invalidation
            List<Long> oldAssigneeIds = currentTask.getAssignees().stream()
                    .map(assignee -> assignee.getUser().getId())
                    .collect(Collectors.toList());
            
            // Update using original service logic
            TaskResponseDto updatedTask = originalTaskService.updateTask(id, dto);
            
            // Update single task cache
            taskCacheService.cacheTask(id, updatedTask);
            log.info("✅ Updated task cache: {}", id);
            
            // Invalidate related caches (old relationships)
            taskCacheService.evictRelatedCaches(id, oldCreatorId, oldTeamId, oldProjectId);
            
            // ✅ FIX: Invalidate caches for ALL assignees
            for (Long assigneeId : oldAssigneeIds) {
                if (!assigneeId.equals(oldCreatorId)) { // Don't duplicate creator eviction
                    taskCacheService.evictRelatedCaches(null, assigneeId, null, null);
                    log.info("✅ Evicted assignee cache: {}", assigneeId);
                }
            }
            
            // Invalidate related caches (new relationships if changed)
            Long newTeamId = dto.getGroupId();
            Long newProjectId = updatedTask.getProjectId();
            if ((newTeamId != null && !newTeamId.equals(oldTeamId)) || 
                (newProjectId != null && !newProjectId.equals(oldProjectId))) {
                taskCacheService.evictRelatedCaches(null, updatedTask.getCreatorId(), newTeamId, newProjectId);
            }
            
            log.info("✅ Task updated and cache refreshed: {}", id);
            return updatedTask;
            
        } catch (Exception e) {
            log.error("❌ CACHE ERROR: Failed to update task: {}", id, e);
            throw e;
        }
    }

    /**
     * Delete task with comprehensive cache cleanup (Manual Redis)
     */
    @Transactional
    public void deleteTask(Long id) {
        log.info("🗑️ REDIS CACHE: TaskServiceCached.deleteTask called - id={}", id);
        
        try {
            // Get task details before deletion for cache cleanup
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Task not found"));
            
            Long creatorId = task.getCreator().getId();
            Long teamId = task.getTeam() != null ? task.getTeam().getId() : null;
            Long projectId = task.getProject() != null ? task.getProject().getId() : null;
            
            // Delete using original service logic
            originalTaskService.deleteTask(id);
            
            // Comprehensive cache cleanup
            taskCacheService.evictRelatedCaches(id, creatorId, teamId, projectId);
            
            log.info("✅ Task deleted and cache cleaned: {}", id);
            
        } catch (Exception e) {
            log.error("❌ CACHE ERROR: Failed to delete task: {}", id, e);
            throw e;
        }
    }

    /**
     * Get user tasks with caching
     */
    public List<TaskResponseDto> getUserTasks(Long userId) {
        log.debug("👤 Getting tasks for user: {}", userId);
        
        try {
            // Try cache first
            List<TaskResponseDto> cachedTasks = taskCacheService.getUserTasks(userId);
            if (cachedTasks != null) {
                log.debug("🚀 Returning cached user tasks: {} (count: {})", userId, cachedTasks.size());
                return cachedTasks;
            }
            
            // Cache miss - get from database
            log.debug("💾 Cache miss, querying database for user tasks: {}", userId);
            
            // Get current user for security check
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new SecurityException("User not authenticated");
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String currentUserEmail = userDetails.getUsername();
            
            User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

            // Use repository to get tasks
            List<Task> tasks = taskRepository.findMyParticipatingTasks(currentUser, 
                    org.springframework.data.domain.Pageable.unpaged()).getContent();
            
            List<TaskResponseDto> taskDtos = tasks.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            
            // Cache the result
            taskCacheService.cacheUserTasks(userId, taskDtos);
            
            log.debug("✅ User tasks cached: {} (count: {})", userId, taskDtos.size());
            return taskDtos;
            
        } catch (Exception e) {
            log.error("❌ Failed to get user tasks: {}", userId, e);
            // Fallback to original service
            return originalTaskService.getAllTasks(); // This needs to be adapted
        }
    }

    /**
     * Get team tasks with caching
     */
    public List<TaskResponseDto> getTasksByTeamId(Long teamId) {
        log.debug("👥 Getting tasks for team: {}", teamId);
        
        try {
            // Try cache first
            List<TaskResponseDto> cachedTasks = taskCacheService.getTeamTasks(teamId);
            if (cachedTasks != null) {
                log.debug("🚀 Returning cached team tasks: {} (count: {})", teamId, cachedTasks.size());
                return cachedTasks;
            }
            
            // Cache miss - fallback to original service
            log.debug("💾 Cache miss, querying database for team tasks: {}", teamId);
            List<TaskResponseDto> tasks = originalTaskService.getTasksByTeamId(teamId);
            
            // Cache the result
            taskCacheService.cacheTeamTasks(teamId, tasks);
            
            log.debug("✅ Team tasks cached: {} (count: {})", teamId, tasks.size());
            return tasks;
            
        } catch (Exception e) {
            log.error("❌ Failed to get team tasks: {}", teamId, e);
            // Fallback to original service
            return originalTaskService.getTasksByTeamId(teamId);
        }
    }

    /**
     * Get project tasks with caching
     */
    public List<TaskResponseDto> getTasksByProjectId(Long projectId) {
        log.debug("📁 Getting tasks for project: {}", projectId);
        
        try {
            // Try cache first
            List<TaskResponseDto> cachedTasks = taskCacheService.getProjectTasks(projectId);
            if (cachedTasks != null) {
                log.debug("🚀 Returning cached project tasks: {} (count: {})", projectId, cachedTasks.size());
                return cachedTasks;
            }
            
            // Cache miss - fallback to original service
            log.debug("💾 Cache miss, querying database for project tasks: {}", projectId);
            List<TaskResponseDto> tasks = originalTaskService.getTasksByProjectId(projectId);
            
            // Cache the result
            taskCacheService.cacheProjectTasks(projectId, tasks);
            
            log.debug("✅ Project tasks cached: {} (count: {})", projectId, tasks.size());
            return tasks;
            
        } catch (Exception e) {
            log.error("❌ Failed to get project tasks: {}", projectId, e);
            // Fallback to original service
            return originalTaskService.getTasksByProjectId(projectId);
        }
    }

    // Removed invalidateRelatedCaches method - using TaskCacheService.evictRelatedCaches instead

    /**
     * Warm up caches for active entities
     */
    public void warmUpCaches() {
        log.info("🔥 Starting cache warm-up process...");
        
        try {
            // This could be enhanced to warm up caches for active users/teams/projects
            // For now, we'll just log the intention
            log.info("✅ Cache warm-up completed");
            
        } catch (Exception e) {
            log.error("❌ Cache warm-up failed", e);
        }
    }

    /**
     * Check cache health
     */
    public boolean isCacheHealthy() {
        return taskCacheService.isCacheAvailable();
    }

    /**
     * Get cache statistics
     */
    public TaskCacheService.CacheStats getCacheStats() {
        return taskCacheService.getCacheStats();
    }

    /**
     * Get all tasks with caching (delegated to original service for now)
     */
    public List<TaskResponseDto> getAllTasks() {
        log.debug("📋 Getting all tasks");
        try {
            // For now, delegate to original service
            // In production, you might want to implement organization-level caching
            return originalTaskService.getAllTasks();
        } catch (Exception e) {
            log.error("❌ Failed to get all tasks", e);
            throw e;
        }
    }

    /**
     * Get my tasks with pagination and caching
     */
    public Page<TaskResponseDto> getMyTasks(int page, int size, String sortBy, String sortDir) {
        log.debug("👤 Getting my tasks with pagination: page={}, size={}", page, size);
        try {
            // For now, delegate to original service
            // TODO: Implement pagination-aware caching
            return originalTaskService.getMyTasks(page, size, sortBy, sortDir);
        } catch (Exception e) {
            log.error("❌ Failed to get my tasks", e);
            throw e;
        }
    }

    /**
     * Get my tasks summary with caching
     */
    public Page<MyTaskSummaryDto> getMyTasksSummary(int page, int size, String sortBy, String sortDir) {
        log.info("🚀 REDIS CACHE: TaskServiceCached.getMyTasksSummary called - page={}, size={}", page, size);
        
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new SecurityException("User not authenticated");
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String currentUserEmail = userDetails.getUsername();
            
            User currentUser = userJpaRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

            // Create cache key for this specific page request
            String cacheKey = String.format("user_tasks_summary:%d:page:%d:size:%d:sort:%s:%s", 
                    currentUser.getId(), page, size, sortBy, sortDir);
            
            log.info("🔑 CACHE KEY: {}", cacheKey);
            log.info("🔍 CHECKING REDIS: Attempting to get from cache...");
            
            // Try cache first - cache as List instead of Page
            @SuppressWarnings("unchecked")
            CachedPageData cachedData = (CachedPageData) redisTemplate.opsForValue().get(cacheKey);
            
            log.info("📦 CACHE RESULT: {}", cachedData != null ? "FOUND" : "NOT FOUND");
            
            if (cachedData != null) {
                cacheMetricsService.recordCacheHit("user_tasks_summary");
                log.info("🚀 Cache HIT for user tasks summary: {} (page {}/{})", 
                        currentUserEmail, page + 1, cachedData.getTotalPages());
                
                // Reconstruct Page from cached data
                Pageable pageable = PageRequest.of(page, size, Sort.by(
                    sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy));
                Page<MyTaskSummaryDto> reconstructedPage = new PageImpl<>(
                    cachedData.getContent(), pageable, cachedData.getTotalElements());
                
                return reconstructedPage;
            }
            
            // Cache miss - get from database
            cacheMetricsService.recordCacheMiss("user_tasks_summary");
            log.info("💾 CACHE MISS: Getting data from database for user: {} (page {})", currentUserEmail, page + 1);
            
            Page<MyTaskSummaryDto> summary = originalTaskService.getMyTasksSummary(page, size, sortBy, sortDir);
            
            log.info("📝 CACHE WRITE: Attempting to cache result with key: {}", cacheKey);
            log.info("📊 DATA TO CACHE: {} items, page {}/{}", summary.getNumberOfElements(), page + 1, summary.getTotalPages());
            
            // Create cacheable data structure
            CachedPageData cacheData = new CachedPageData(
                summary.getContent(), 
                summary.getTotalElements(), 
                summary.getTotalPages()
            );
            
            // Cache the result with 5 minutes TTL (shorter for paginated data)
            redisTemplate.opsForValue().set(cacheKey, cacheData, Duration.ofMinutes(5));
            cacheMetricsService.recordCacheWrite("user_tasks_summary");
            
            log.info("✅ CACHE SUCCESS: Cached user tasks summary for user: {} (key: {})", currentUserEmail, cacheKey);
            
            return summary;
            
        } catch (Exception e) {
            log.error("❌ CACHE ERROR: Failed to get my tasks summary with caching", e);
            e.printStackTrace(); // Print full stack trace
            // Fallback to original service
            log.warn("🔄 FALLBACK: Using original TaskService due to cache error");
            return originalTaskService.getMyTasksSummary(page, size, sortBy, sortDir);
        }
    }

    /**
     * Get my tasks statistics with caching
     */
    public Map<String, Object> getMyTasksStats() {
        log.debug("📈 Getting my tasks statistics");
        try {
            // For now, delegate to original service
            // TODO: Implement stats caching with shorter TTL
            return originalTaskService.getMyTasksStats();
        } catch (Exception e) {
            log.error("❌ Failed to get my tasks stats", e);
            throw e;
        }
    }

    /**
     * Map Task entity to DTO (reused from original service)
     */
    private TaskResponseDto mapToDto(Task task) {
        return originalTaskService.mapToDto(task);
    }

    /**
     * Cacheable data structure for Page data
     * Solves PageImpl serialization issues
     */
    public static class CachedPageData {
        private List<MyTaskSummaryDto> content;
        private long totalElements;
        private int totalPages;

        // Default constructor for Jackson
        public CachedPageData() {}

        public CachedPageData(List<MyTaskSummaryDto> content, long totalElements, int totalPages) {
            this.content = content;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
        }

        // Getters and setters
        public List<MyTaskSummaryDto> getContent() {
            return content;
        }

        public void setContent(List<MyTaskSummaryDto> content) {
            this.content = content;
        }

        public long getTotalElements() {
            return totalElements;
        }

        public void setTotalElements(long totalElements) {
            this.totalElements = totalElements;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }
    }
}