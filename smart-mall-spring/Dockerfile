# Use OpenJDK 21 with Alpine Linux for smaller size
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Copy gradle files
COPY gradle gradle
COPY build.gradle settings.gradle gradlew ./

# Copy source code
COPY src src

# Build the application
RUN chmod +x ./gradlew && ./gradlew clean build -x test

# Production stage
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring

# Install curl for health checks
RUN apk add --no-cache curl

# Copy JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]