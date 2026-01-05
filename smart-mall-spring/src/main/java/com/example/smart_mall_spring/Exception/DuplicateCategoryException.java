package com.example.smart_mall_spring.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class DuplicateCategoryException extends RuntimeException {
    
    private final HttpStatus status;

    public DuplicateCategoryException(String message) {
        super(message);
        this.status = HttpStatus.CONFLICT;
    }
}
