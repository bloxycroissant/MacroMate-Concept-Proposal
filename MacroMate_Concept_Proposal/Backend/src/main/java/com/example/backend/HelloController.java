package com.example.backend;

import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class HelloController {
    private final FoodEntryRepository foodEntryRepository;
    private final WorkoutEntryRepository workoutEntryRepository;

    public HelloController(FoodEntryRepository foodEntryRepository, WorkoutEntryRepository workoutEntryRepository) {
        this.foodEntryRepository = foodEntryRepository;
        this.workoutEntryRepository = workoutEntryRepository;
    }

    @GetMapping("/api/hello")
    public Map<String, String> sayHello() {
        return Map.of("message", "Success! Your React app triggered your new Java backend!");
    }

    @GetMapping("/api/food-entries")
    public List<FoodEntry> getFoodEntries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            return foodEntryRepository.findAll(Sort.by("entryDate", "id"));
        }
        return foodEntryRepository.findByEntryDateOrderByIdAsc(date);
    }

    @PostMapping("/api/food-entries")
    @ResponseStatus(HttpStatus.CREATED)
    public FoodEntry addFoodEntry(@Valid @RequestBody FoodEntryRequest request) {
        return foodEntryRepository.save(request.toEntity());
    }

    @DeleteMapping("/api/food-entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFoodEntry(@PathVariable Long id) {
        FoodEntry entry = foodEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food entry not found."));
        foodEntryRepository.delete(entry);
    }

    @GetMapping("/api/workouts")
    public List<WorkoutEntry> getWorkouts() {
        return workoutEntryRepository.findAll(Sort.by(Sort.Direction.DESC, "workoutDate", "id"));
    }

    @PostMapping("/api/workouts")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutEntry addWorkout(@Valid @RequestBody WorkoutEntryRequest request) {
        return workoutEntryRepository.save(request.toEntity());
    }

    @DeleteMapping("/api/workouts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkout(@PathVariable Long id) {
        WorkoutEntry workout = workoutEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found."));
        workoutEntryRepository.delete(workout);
    }
}
