package com.example.smart_mall_spring.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class EntityNotFoundException extends RuntimeException {

    private final HttpStatus status;

    public EntityNotFoundException(String entityName) {
        super(entityName + " not present in the system");
        this.status = HttpStatus.GONE;
    }
}
