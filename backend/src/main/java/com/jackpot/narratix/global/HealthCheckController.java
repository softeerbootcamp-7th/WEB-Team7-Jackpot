package com.jackpot.narratix.global;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HealthCheckController {

    @GetMapping(value = "/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("healthy");
    }
}