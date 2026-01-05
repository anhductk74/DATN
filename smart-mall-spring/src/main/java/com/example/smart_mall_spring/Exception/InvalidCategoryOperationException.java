package com.example.smart_mall_spring.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class InvalidCategoryOperationException extends RuntimeException {
    
    private final HttpStatus status;

    public InvalidCategoryOperationException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }
}
