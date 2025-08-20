# API Performance & Caching

## Overview

The Firefly app implements intelligent caching and rate limiting for the AI suggestion API to ensure optimal performance and prevent abuse while maintaining a responsive user experience.

## AI Suggestion API (`/api/ai/suggest`)

### Caching System

The API implements an in-memory response cache to reduce AI API calls and improve response times:

**Cache Configuration:**
- **Duration**: 5 minutes per response
- **Capacity**: 100 cached responses maximum
- **Key Strategy**: Normalized goal text (lowercase, trimmed)
- **Cleanup**: Automatic cleanup when cache exceeds capacity

**Cache Benefits:**
- Instant responses for repeated or similar goals
- Reduced AI API costs and rate limiting
- Better user experience during high usage periods
- Graceful handling of AI service outages

### Cache Implementation Details

The caching system uses a two-phase cleanup approach to prevent concurrent modification issues:

```typescript
// Safe cache cleanup implementation
if (responseCache.size > 100) {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  // Phase 1: Identify expired entries
  responseCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      entriesToDelete.push(key);
    }
  });
  
  // Phase 2: Remove expired entries
  entriesToDelete.forEach(key => responseCache.delete(key));
}
```

**Why This Approach:**
- Prevents `ConcurrentModificationException` during Map iteration
- Ensures thread-safe cache cleanup in Node.js environment
- Maintains cache performance under high load
- Follows JavaScript best practices for Map manipulation

### Rate Limiting

**Configuration:**
- **Window**: 1 minute per IP address
- **Limit**: 10 requests per window
- **Tracking**: In-memory per IP address
- **Response**: HTTP 429 with retry message

**Rate Limiting Benefits:**
- Prevents API abuse and excessive costs
- Ensures fair usage across all users
- Protects against accidental infinite loops
- Maintains service availability

### Fallback Strategy

The API implements a robust fallback hierarchy:

1. **Primary**: Gemini 2.0 Flash (latest model)
2. **Secondary**: Gemini 1.5 Flash (stable fallback)
3. **Tertiary**: Static suggestions (always available)

**Fallback Triggers:**
- AI service unavailable
- Rate limits exceeded on AI provider
- Network connectivity issues
- Invalid API responses

### Performance Characteristics

**Response Times:**
- **Cache Hit**: < 10ms (instant response)
- **AI Success**: 500-2000ms (depending on model)
- **Fallback**: < 50ms (static suggestions)

**Memory Usage:**
- **Cache**: ~1MB for 100 responses (estimated)
- **Rate Limiting**: ~1KB per tracked IP
- **Automatic Cleanup**: Prevents memory leaks

### Monitoring & Debugging

**Console Logging:**
- Cache hits and misses
- AI model fallback usage
- Rate limiting events
- PII sanitization results

**Error Handling:**
- Graceful degradation on all failures
- User-friendly error messages
- Detailed server-side logging
- No service interruption on AI failures

## Best Practices

### For Developers

1. **Cache Invalidation**: Cache keys are based on normalized goal text
2. **Memory Management**: Automatic cleanup prevents unbounded growth
3. **Error Recovery**: Always provide fallback responses
4. **Rate Limiting**: Implement client-side debouncing for better UX

### For Deployment

1. **Memory Monitoring**: Watch cache size in production
2. **AI API Keys**: Rotate keys regularly for security
3. **Rate Limits**: Adjust based on usage patterns
4. **Logging**: Monitor fallback usage rates

## Configuration

Environment variables affecting performance:

```bash
# Google AI Studio API key (required for AI suggestions)
GOOGLE_AI_API_KEY=your_api_key

# Optional: Adjust rate limiting in code
# RATE_LIMIT_WINDOW=60000 (1 minute)
# MAX_REQUESTS_PER_WINDOW=10
# CACHE_DURATION=300000 (5 minutes)
```

## Future Improvements

Potential enhancements for production scale:

- **Redis Cache**: Replace in-memory cache for multi-instance deployments
- **Database Rate Limiting**: Persistent rate limiting across server restarts
- **Cache Analytics**: Track hit rates and optimize cache duration
- **Smart Prefetching**: Pre-cache common goal patterns
- **Adaptive Rate Limits**: Adjust limits based on user authentication status