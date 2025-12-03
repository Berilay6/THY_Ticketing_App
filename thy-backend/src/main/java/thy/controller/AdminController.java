package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.PlaneRequestDTO;
import thy.entity.Seat;
import thy.service.SeatService;
import thy.service.StorageService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StorageService storageService;
    private final SeatService seatService;

    @PostMapping("/planes")
    public ResponseEntity<String> addPlane(@RequestBody PlaneRequestDTO request) {
        storageService.addPlane(request);
        return ResponseEntity.ok("Plane created and seats generated successfully.");
    }

    @PutMapping("/planes/{planeId}/seats/{seatNumber}/status")
    public ResponseEntity<Seat> updateSeatStatus(
            @PathVariable Long planeId,
            @PathVariable String seatNumber)
    {
        // Service metodu çağrılır
        Seat updatedSeat = seatService.updateSeatStatus(planeId, seatNumber);
        return ResponseEntity.noContent().build();
    }
}