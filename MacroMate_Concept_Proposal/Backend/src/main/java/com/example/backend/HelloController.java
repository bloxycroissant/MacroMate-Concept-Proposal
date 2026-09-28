package com.example.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Stops browsers from blocking requests
public class HelloController {

    @GetMapping("/api/hello")
    public Map<String, String> sayHello() {
        return Map.of("message", "Success! Your React app triggered your new Java backend!");
    }
}