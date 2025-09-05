@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final TaskJpaRepository taskRepository;
    // ... other repositories
    
    private static final String USER_TASKS_KEY = "user_tasks:";
    private static final String TEAM_TASKS_KEY = "team_tasks:";
    private static final String PROJECT_TASKS_KEY = "project_tasks:";
    private static final String TASK_KEY = "task:";
    private static final int CACHE_TTL = 600; // 10 minutes
    
    // CREATE Task với cache update
    public TaskResponseDto createTask(CreateTaskRequestDto dto) {
        // Tạo task trong DB
        Task task = // ... existing logic
        taskRepository.save(task);
        
        // Cache single task
        cacheTask(task);
        
        // Invalidate related caches
        invalidateUserTasksCache(dto.getCreatorId());
        if (dto.getGroupId() != null) {
            invalidateTeamTasksCache(dto.getGroupId());
        }
        if (dto.getProjectId() != null) {
            invalidateProjectTasksCache(dto.getProjectId());
        }
        
        return mapToDto(task);
    }
    
    // READ Task với cache-first strategy
    @Cacheable(value = "tasks", key = "#id")
    public TaskResponseDto getTaskById(Long id) {
        String cacheKey = TASK_KEY + id;
        
        // Check Redis cache first
        TaskResponseDto cachedTask = (TaskResponseDto) redisTemplate.opsForValue().get(cacheKey);
        if (cachedTask != null) {
            System.out.println("🚀 Cache HIT for task: " + id);
            return cachedTask;
        }
        
        // Cache miss - query DB
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        
        TaskResponseDto taskDto = mapToDto(task);
        
        // Cache the result
        redisTemplate.opsForValue().set(cacheKey, taskDto, Duration.ofSeconds(CACHE_TTL));
        System.out.println("💾 Cached task: " + id);
        
        return taskDto;
    }
    
    // UPDATE Task với cache refresh
    @CachePut(value = "tasks", key = "#id")
    public TaskResponseDto updateTask(Long id, UpdateTaskRequestDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        
        // Store old values for cache invalidation
        Long oldTeamId = task.getTeam() != null ? task.getTeam().getId() : null;
        Long oldProjectId = task.getProject() != null ? task.getProject().getId() : null;
        
        // Update task
        // ... existing update logic
        taskRepository.save(task);
        
        TaskResponseDto updatedTask = mapToDto(task);
        
        // Update single task cache
        cacheTask(task);
        
        // Invalidate related caches
        invalidateUserTasksCache(task.getCreator().getId());
        if (oldTeamId != null) invalidateTeamTasksCache(oldTeamId);
        if (oldProjectId != null) invalidateProjectTasksCache(oldProjectId);
        if (dto.getGroupId() != null && !dto.getGroupId().equals(oldTeamId)) {
            invalidateTeamTasksCache(dto.getGroupId());
        }
        
        return updatedTask;
    }
    
    // DELETE Task với cache cleanup
    @CacheEvict(value = "tasks", key = "#id")
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        
        // Store values for cache cleanup
        Long creatorId = task.getCreator().getId();
        Long teamId = task.getTeam() != null ? task.getTeam().getId() : null;
        Long projectId = task.getProject() != null ? task.getProject().getId() : null;
        
        taskRepository.delete(task);
        
        // Remove from single task cache
        redisTemplate.delete(TASK_KEY + id);
        
        // Invalidate related caches
        invalidateUserTasksCache(creatorId);
        if (teamId != null) invalidateTeamTasksCache(teamId);
        if (projectId != null) invalidateProjectTasksCache(projectId);
    }
    
    // Cache helper methods
    private void cacheTask(Task task) {
        String cacheKey = TASK_KEY + task.getId();
        TaskResponseDto taskDto = mapToDto(task);
        redisTemplate.opsForValue().set(cacheKey, taskDto, Duration.ofSeconds(CACHE_TTL));
    }
    
    private void invalidateUserTasksCache(Long userId) {
        redisTemplate.delete(USER_TASKS_KEY + userId);
        System.out.println("🗑️ Invalidated user tasks cache: " + userId);
    }
    
    private void invalidateTeamTasksCache(Long teamId) {
        redisTemplate.delete(TEAM_TASKS_KEY + teamId);
        System.out.println("🗑️ Invalidated team tasks cache: " + teamId);
    }
    
    private void invalidateProjectTasksCache(Long projectId) {
        redisTemplate.delete(PROJECT_TASKS_KEY + projectId);
        System.out.println("🗑️ Invalidated project tasks cache: " + projectId);
    }
}