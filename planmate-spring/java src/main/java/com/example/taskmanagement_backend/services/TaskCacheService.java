@Service
@RequiredArgsConstructor
public class TaskCacheService {
    
    private final TaskService taskService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    // Warm up cache cho active users
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void warmUpUserTasksCache() {
        // Get active users (có thể dựa trên last login)
        List<Long> activeUserIds = getActiveUserIds();
        
        for (Long userId : activeUserIds) {
            try {
                taskService.getUserTasks(userId);
                System.out.println("🔥 Warmed up cache for user: " + userId);
            } catch (Exception e) {
                System.err.println("❌ Failed to warm up cache for user: " + userId);
            }
        }
    }
    
    // Refresh cache khi có thay đổi lớn
    public void refreshAllTaskCaches() {
        Set<String> keys = redisTemplate.keys("user_tasks:*");
        if (keys != null) {
            redisTemplate.delete(keys);
        }
        
        keys = redisTemplate.keys("team_tasks:*");
        if (keys != null) {
            redisTemplate.delete(keys);
        }
        
        keys = redisTemplate.keys("project_tasks:*");
        if (keys != null) {
            redisTemplate.delete(keys);
        }
        
        System.out.println("🔄 Refreshed all task caches");
    }
}