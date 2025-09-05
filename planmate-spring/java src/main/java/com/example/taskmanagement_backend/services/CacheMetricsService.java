@Service
@RequiredArgsConstructor
public class CacheMetricsService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);
    
    public void recordCacheHit() {
        cacheHits.incrementAndGet();
    }
    
    public void recordCacheMiss() {
        cacheMisses.incrementAndGet();
    }
    
    public Map<String, Object> getCacheStats() {
        long hits = cacheHits.get();
        long misses = cacheMisses.get();
        long total = hits + misses;
        double hitRate = total > 0 ? (double) hits / total * 100 : 0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("cacheHits", hits);
        stats.put("cacheMisses", misses);
        stats.put("hitRate", String.format("%.2f%%", hitRate));
        stats.put("totalRequests", total);
        
        return stats;
    }
}