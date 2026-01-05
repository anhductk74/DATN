package com.example.smart_mall_spring.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CategoryNotFoundException extends RuntimeException {
    
    private final HttpStatus status;

    public CategoryNotFoundException(String message) {
        super(message);
        this.status = HttpStatus.NOT_FOUND;
    }
    
    public CategoryNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.NOT_FOUND;
    }
}
