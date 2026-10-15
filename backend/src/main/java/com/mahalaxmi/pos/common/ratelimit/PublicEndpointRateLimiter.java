package com.mahalaxmi.pos.common.ratelimit;

import com.mahalaxmi.pos.common.exception.RateLimitExceededException;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PublicEndpointRateLimiter {

    private final Map<String, Deque<Long>> requestLogs = new ConcurrentHashMap<>();
    private final int maxRequestsPerWindow;
    private final long windowDurationMs;

    public PublicEndpointRateLimiter() {
        // Default: 20 requests per 10-minute rolling window per IP
        this(20, 10 * 60 * 1000L);
    }

    public PublicEndpointRateLimiter(int maxRequestsPerWindow, long windowDurationMs) {
        this.maxRequestsPerWindow = maxRequestsPerWindow;
        this.windowDurationMs = windowDurationMs;
    }

    public synchronized void checkRateLimit(String clientIp) {
        String key = (clientIp != null && !clientIp.isBlank()) ? clientIp.trim() : "unknown";
        long now = System.currentTimeMillis();
        long windowStart = now - windowDurationMs;

        Deque<Long> timestamps = requestLogs.computeIfAbsent(key, k -> new ArrayDeque<>());

        // Evict timestamps older than rolling window
        while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequestsPerWindow) {
            throw new RateLimitExceededException(
                    "Too many requests from your network. Please wait a few minutes before submitting another order."
            );
        }

        timestamps.addLast(now);

        // Periodic cleanup of dormant keys if map grows large
        if (requestLogs.size() > 5000) {
            requestLogs.entrySet().removeIf(entry -> entry.getValue().isEmpty() || entry.getValue().peekLast() < windowStart);
        }
    }

    public void clear() {
        requestLogs.clear();
    }
}
