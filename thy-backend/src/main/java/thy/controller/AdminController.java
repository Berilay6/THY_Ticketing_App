package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.PlaneDTO;
import thy.dto.PlaneRequestDTO;
import thy.entity.Plane;
import thy.entity.Seat;
import thy.service.PlaneService;
import thy.service.SeatService;
import thy.service.StorageService;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    private final StorageService storageService;
    private final SeatService seatService;
    private final PlaneService planeService;

    @GetMapping("/planes")
    public ResponseEntity<List<PlaneDTO>> getAllPlanes() {
        logger.info("GET /api/admin/planes called");
        try {
            List<Plane> planes = planeService.getAllPlanes();
            logger.info("Found {} planes in database", planes.size());
            
            List<PlaneDTO> dtos = planes.stream().map(p -> {
                String airportName = p.getAirport() != null ? 
                    p.getAirport().getName() + " (" + p.getAirport().getIataCode() + ")" : 
                    "Storage";
                logger.info("Mapping plane {} with airport: {}", p.getPlaneId(), airportName);
                return new PlaneDTO(
                    p.getPlaneId(),
                    p.getModelType(),
                    p.getStatus().toString(),
                    airportName
                );
            }).collect(Collectors.toList());
            
            logger.info("Returning {} plane DTOs", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching planes", e);
            throw e;
        }
    }

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
        Seat updatedSeat = seatService.updateSeatStatus(planeId, seatNumber);
        return ResponseEntity.noContent().build();
    }
}