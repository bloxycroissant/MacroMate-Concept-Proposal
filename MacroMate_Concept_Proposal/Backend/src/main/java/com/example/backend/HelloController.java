package com.example.backend;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, @AuthenticationPrincipal Jwt jwt) {
        Sort sort = Sort.by("entryDate", "id");
        List<FoodEntry> entries = jwt == null ? foodEntryRepository.findByUserIdIsNull(sort)
                : foodEntryRepository.findByUserId(jwt.getSubject(), sort);
        return date == null ? entries : entries.stream().filter(entry -> date.equals(entry.getEntryDate())).toList();
    }

    @PostMapping("/api/food-entries")
    @ResponseStatus(HttpStatus.CREATED)
    public FoodEntry addFoodEntry(@Valid @RequestBody FoodEntryRequest request, @AuthenticationPrincipal Jwt jwt) {
        FoodEntry entry = request.toEntity();
        entry.setUserId(jwt == null ? null : jwt.getSubject());
        return foodEntryRepository.save(entry);
    }

    @DeleteMapping("/api/food-entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFoodEntry(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        FoodEntry entry = (jwt == null ? foodEntryRepository.findByIdAndUserIdIsNull(id)
                : foodEntryRepository.findByIdAndUserId(id, jwt.getSubject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food entry not found."));
        foodEntryRepository.delete(entry);
    }

    @GetMapping("/api/workouts")
    public List<WorkoutEntry> getWorkouts(@AuthenticationPrincipal Jwt jwt) {
        Sort sort = Sort.by(Sort.Direction.DESC, "workoutDate", "id");
        return jwt == null ? workoutEntryRepository.findByUserIdIsNull(sort)
                : workoutEntryRepository.findByUserId(jwt.getSubject(), sort);
    }

    @PostMapping("/api/workouts")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutEntry addWorkout(@Valid @RequestBody WorkoutEntryRequest request, @AuthenticationPrincipal Jwt jwt) {
        WorkoutEntry entry = request.toEntity();
        entry.setUserId(jwt == null ? null : jwt.getSubject());
        return workoutEntryRepository.save(entry);
    }

    @DeleteMapping("/api/workouts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkout(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        WorkoutEntry workout = (jwt == null ? workoutEntryRepository.findByIdAndUserIdIsNull(id)
                : workoutEntryRepository.findByIdAndUserId(id, jwt.getSubject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found."));
        workoutEntryRepository.delete(workout);
    }
}
