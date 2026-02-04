package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.controller.response.LibraryListResponse;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.service.LibraryService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/library")
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/all")
    public ResponseEntity<LibraryListResponse> getLibraryList(
            @UserId String userId,
            @RequestParam LibraryType libraryType
    ) {
        List<String> libraries = libraryService.getLibraryList(userId, libraryType);
        return ResponseEntity.ok(new LibraryListResponse(libraries));
    }

    @GetMapping("/company/all")
    public ResponseEntity<CompanyLibraryResponse> getCompanyLibraries(
            @UserId String userId,
            @RequestParam @NotBlank String companyName,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(required = false) @Positive Long lastCoverLetterId
    ) {
        return ResponseEntity.ok(
                libraryService.getCompanyLibraries(userId, companyName, size, lastCoverLetterId)
        );
    }
}
