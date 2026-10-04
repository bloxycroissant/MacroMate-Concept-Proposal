package com.example.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HelloController {
    private final FoodEntryRepository foodEntryRepository;

    public HelloController(FoodEntryRepository foodEntryRepository) {
        this.foodEntryRepository = foodEntryRepository;
    }

    @GetMapping("/api/hello")
    public Map<String, String> sayHello() {
        return Map.of("message", "Success! Your React app triggered your new Java backend!");
    }

    @GetMapping("/api/food-entries")
    public List<FoodEntry> getFoodEntries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            return foodEntryRepository.findAll();
        }
        return foodEntryRepository.findByEntryDateOrderByIdAsc(date);
    }

    @PostMapping("/api/food-entries")
    @ResponseStatus(HttpStatus.CREATED)
    public FoodEntry addFoodEntry(@RequestBody FoodEntry foodEntry) {
        if (foodEntry.getEntryDate() == null) {
            foodEntry.setEntryDate(LocalDate.now());
        }
        return foodEntryRepository.save(foodEntry);
    }

    @DeleteMapping("/api/food-entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFoodEntry(@PathVariable Long id) {
        foodEntryRepository.deleteById(id);
    }
}