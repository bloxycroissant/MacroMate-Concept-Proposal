package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:journal-tests;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class FoodEntryApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired FoodEntryRepository repository;

    @BeforeEach void resetDatabase() { repository.deleteAll(); }

    private ObjectNode entry(String date) {
        return mapper.createObjectNode().put("meal", "Breakfast").put("foodName", "  Oatmeal  ")
                .put("calories", 250).put("protein", 8.5).put("carbs", 40.0).put("fat", 5.0).put("entryDate", date);
    }

    private long create(ObjectNode entry) throws Exception {
        String content = mvc.perform(post("/api/food-entries").contentType(MediaType.APPLICATION_JSON).content(entry.toString()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.foodName").value("Oatmeal"))
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(content).get("id").asLong();
    }

    @Test void savesFiltersAndDeletesEntries() throws Exception {
        long id = create(entry("2026-10-14"));
        create(entry("2026-10-13"));
        mvc.perform(get("/api/food-entries").param("date", "2026-10-14"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id)).andExpect(jsonPath("$[0].protein").value(8.5));
        mvc.perform(get("/api/food-entries")).andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].entryDate").value("2026-10-13"));
        mvc.perform(delete("/api/food-entries/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/food-entries").param("date", "2026-10-14")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/food-entries/{id}", id)).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @CsvSource({"calories,-1", "protein,-0.1", "carbs,-1", "fat,-1", "calories,1000001", "protein,100001", "meal,Brunch"})
    void rejectsOutOfRangeValues(String field, String value) throws Exception {
        ObjectNode body = entry("2026-10-14").put(field, value);
        mvc.perform(post("/api/food-entries").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields." + field).exists());
        assertThat(repository.count()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"meal", "foodName", "calories", "protein", "carbs", "fat", "entryDate"})
    void rejectsMissingFields(String field) throws Exception {
        ObjectNode body = entry("2026-10-14");
        body.remove(field);
        mvc.perform(post("/api/food-entries").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields." + field).exists());
    }

    @Test void rejectsBlankNameAndMalformedDate() throws Exception {
        mvc.perform(post("/api/food-entries").contentType(MediaType.APPLICATION_JSON)
                .content(entry("2026-10-14").put("foodName", "   ").toString())).andExpect(status().isBadRequest());
        mvc.perform(post("/api/food-entries").contentType(MediaType.APPLICATION_JSON)
                .content(entry("not-a-date").toString())).andExpect(status().isBadRequest());
        assertThat(repository.count()).isZero();
    }

    @Test void suppliedIdCannotOverwriteAnExistingEntry() throws Exception {
        long first = create(entry("2026-10-14"));
        long second = create(entry("2026-10-13").put("id", first));
        assertThat(second).isNotEqualTo(first);
        assertThat(repository.findById(first).orElseThrow().getEntryDate().toString()).isEqualTo("2026-10-14");
    }

    @ParameterizedTest
    @ValueSource(strings = {"http://localhost:5173", "http://127.0.0.1:5173"})
    void allowsBothLocalFrontendOrigins(String origin) throws Exception {
        mvc.perform(post("/api/food-entries").header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON).content(entry("2026-10-14").toString()))
                .andExpect(status().isCreated()).andExpect(header().string("Access-Control-Allow-Origin", origin));
    }
}
