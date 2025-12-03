package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.PlaneDTO;
import thy.dto.PlaneRequestDTO;
import thy.dto.FlightDTO;
import thy.entity.Airport;
import thy.entity.Flight;
import thy.entity.Plane;
import thy.entity.Seat;
import thy.service.AirportService;
import thy.service.PlaneService;
import thy.service.FlightService;
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
    private final AirportService airportService;
    private final FlightService flightService;

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
                Long currentAirportId = p.getAirport() != null ? p.getAirport().getAirportId() : null;
                String currentAirportIata = p.getAirport() != null ? p.getAirport().getIataCode() : null;
                
                logger.info("Mapping plane {} with airport: {}", p.getPlaneId(), airportName);
                return new PlaneDTO(
                    p.getPlaneId(),
                    p.getModelType(),
                    p.getStatus().toString(),
                    airportName,
                    currentAirportId,
                    currentAirportIata
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
        logger.info("POST /api/admin/planes called with modelType: {}", request.getModelType());
        try {
            Plane plane = storageService.addPlane(request);
            logger.info("Plane created successfully: {} (ID: {})", plane.getModelType(), plane.getPlaneId());
            return ResponseEntity.ok("Plane created and seats generated successfully. Plane ID: " + plane.getPlaneId());
        } catch (Exception e) {
            logger.error("Error creating plane: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/planes/{planeId}")
    public ResponseEntity<String> deletePlane(@PathVariable Long planeId) {
        logger.info("DELETE /api/admin/planes/{} called", planeId);
        try {
            storageService.deletePlane(planeId);
            logger.info("Plane {} deleted successfully", planeId);
            return ResponseEntity.ok("Plane deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting plane {}: {}", planeId, e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> getAllAirports() {
        logger.info("GET /api/admin/airports called");
        List<Airport> airports = airportService.getAllAirports();
        logger.info("Returning {} airports", airports.size());
        return ResponseEntity.ok(airports);
    }

    @PostMapping("/airports")
    public ResponseEntity<String> addAirport(@RequestBody thy.dto.AirportRequestDTO request) {
        logger.info("POST /api/admin/airports called with data: {}", request);
        try {
            Airport airport = airportService.addAirport(request);
            logger.info("Airport created successfully: {} ({})", airport.getName(), airport.getIataCode());
            return ResponseEntity.ok("Airport created successfully: " + airport.getName() + " (" + airport.getIataCode() + ")");
        } catch (Exception e) {
            logger.error("Error creating airport: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/airports/{airportId}")
    public ResponseEntity<String> deleteAirport(@PathVariable Long airportId) {
        logger.info("DELETE /api/admin/airports/{} called - clearing airport operations", airportId);
        try {
            airportService.clearAirport(airportId);
            logger.info("Airport {} cleared successfully: all flights cancelled and planes moved to storage", airportId);
            return ResponseEntity.ok("Airport operations cleared. All flights cancelled, refunds processed, and planes moved to storage.");
        } catch (Exception e) {
            logger.error("Error clearing airport {}: {}", airportId, e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/airports/{airportId}")
    public ResponseEntity<Airport> getAirportById(@PathVariable Long airportId) {
        logger.info("GET /api/admin/airports/{} called", airportId);
        Airport airport = airportService.getAirportById(airportId);
        return ResponseEntity.ok(airport);
    }

    @GetMapping("/airports/{airportId}/planes")
    public ResponseEntity<List<PlaneDTO>> getPlanesByAirport(@PathVariable Long airportId) {
        logger.info("GET /api/admin/airports/{}/planes called", airportId);
        List<Plane> planes = planeService.getPlanesByAirport(airportId);
        logger.info("Found {} planes at airport {}", planes.size(), airportId);
        
        List<PlaneDTO> dtos = planes.stream().map(p -> {
            String airportName = p.getAirport() != null ? 
                p.getAirport().getName() + " (" + p.getAirport().getIataCode() + ")" : 
                "Storage";
            Long currentAirportId = p.getAirport() != null ? p.getAirport().getAirportId() : null;
            String currentAirportIata = p.getAirport() != null ? p.getAirport().getIataCode() : null;
            
            return new PlaneDTO(
                p.getPlaneId(),
                p.getModelType(),
                p.getStatus().toString(),
                airportName,
                currentAirportId,
                currentAirportIata
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/flights")
    public ResponseEntity<List<FlightDTO>> getAllFlights() {
        logger.info("GET /api/admin/flights called");
        try {
            List<Flight> flights = flightService.getAllFlights();
            logger.info("Found {} flights in database", flights.size());
            
            List<FlightDTO> dtos = flights.stream().map(f -> {
                String route = f.getOriginAirport().getIataCode() + " - " + f.getDestinationAirport().getIataCode();
                String planeInfo = f.getPlane().getModelType() + " (" + f.getPlane().getPlaneId() + ")";
                logger.info("Mapping flight {} with route: {}", f.getFlightId(), route);
                return new FlightDTO(
                    f.getFlightId(),
                    route,
                    f.getDepartureTime().toString(),
                    f.getArrivalTime().toString(),
                    planeInfo,
                    f.getStatus().toString()
                );
            }).collect(Collectors.toList());
            
            logger.info("Returning {} flight DTOs", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching flights", e);
            throw e;
        }
    }

    @PostMapping("/flights")
    public ResponseEntity<String> createFlight(@RequestBody thy.dto.FlightCreateRequestDTO request) {
        logger.info("POST /api/admin/flights called");
        logger.info("Request: originAirport={}, destAirport={}, plane={}, departure={}, arrival={}, basePrice={}", 
            request.getOriginAirportId(), 
            request.getDestinationAirportId(),
            request.getPlaneId(),
            request.getDepartureTime(),
            request.getArrivalTime(),
            request.getBasePricePerHour());
        try {
            flightService.createFlight(request);
            logger.info("Flight created successfully");
            return ResponseEntity.ok("Flight created successfully with all seats");
        } catch (Exception e) {
            logger.error("Error creating flight: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/planes/{planeId}")
    public ResponseEntity<?> getPlaneById(@PathVariable Long planeId) {
        logger.info("GET /api/admin/planes/{} called", planeId);
        Plane plane = planeService.getAllPlanes().stream()
            .filter(p -> p.getPlaneId().equals(planeId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + planeId));
        
        // Create a clean DTO to avoid circular reference issues
        var dto = new java.util.HashMap<String, Object>();
        dto.put("planeId", plane.getPlaneId());
        dto.put("modelType", plane.getModelType());
        dto.put("status", plane.getStatus().toString());
        
        if (plane.getAirport() != null) {
            var airportInfo = new java.util.HashMap<String, Object>();
            airportInfo.put("airportId", plane.getAirport().getAirportId());
            airportInfo.put("name", plane.getAirport().getName());
            airportInfo.put("iataCode", plane.getAirport().getIataCode());
            airportInfo.put("city", plane.getAirport().getCity());
            airportInfo.put("country", plane.getAirport().getCountry());
            dto.put("airport", airportInfo);
        } else {
            dto.put("airport", null);
        }
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/planes/{planeId}/seats")
    public ResponseEntity<List<java.util.Map<String, Object>>> getPlaneSeats(@PathVariable Long planeId) {
        logger.info("GET /api/admin/planes/{}/seats called", planeId);
        List<Seat> seats = seatService.getSeatsByPlaneId(planeId);
        logger.info("Found {} seats for plane {}", seats.size(), planeId);
        
        // Log each seat for debugging
        seats.forEach(seat -> 
            logger.info("Seat: {} - Type: {} - Status: {}", 
                seat.getSeatNumber(), seat.getType(), seat.getStatus())
        );
        
        // Convert to clean DTOs to avoid serialization issues
        List<java.util.Map<String, Object>> seatDTOs = seats.stream().map(seat -> {
            var dto = new java.util.HashMap<String, Object>();
            dto.put("planeId", seat.getPlaneId());
            dto.put("seatNumber", seat.getSeatNumber());
            dto.put("type", seat.getType().toString());
            dto.put("status", seat.getStatus().toString());
            return dto;
        }).collect(Collectors.toList());
        
        logger.info("Returning {} seat DTOs", seatDTOs.size());
        return ResponseEntity.ok(seatDTOs);
    }

    @PostMapping("/planes/{planeId}/malfunction")
    public ResponseEntity<String> reportMalfunction(@PathVariable Long planeId, @RequestParam(defaultValue = "false") boolean retired) {
        logger.info("POST /api/admin/planes/{}/malfunction called (retired={})", planeId, retired);
        String result = planeService.reportMalfunction(planeId, retired);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/planes/{planeId}/status")
    public ResponseEntity<String> togglePlaneStatus(@PathVariable Long planeId) {
        logger.info("PUT /api/admin/planes/{}/status called", planeId);
        try {
            String result = planeService.togglePlaneStatus(planeId);
            logger.info("Toggle plane status successful: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error toggling plane status for plane {}: {}", planeId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/planes/{planeId}/airport/{airportId}")
    public ResponseEntity<String> deployPlaneToAirport(
            @PathVariable Long planeId,
            @PathVariable Long airportId) {
        logger.info("PUT /api/admin/planes/{}/airport/{} called", planeId, airportId);
        try {
            String result = planeService.deployPlaneToAirport(planeId, airportId);
            logger.info("Deploy plane successful: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error deploying plane {} to airport {}: {}", planeId, airportId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/planes/{planeId}/seats/{seatNumber}/status")
    public ResponseEntity<java.util.Map<String, Object>> updateSeatStatus(
            @PathVariable Long planeId,
            @PathVariable String seatNumber)
    {
        logger.info("PUT /api/admin/planes/{}/seats/{}/status called", planeId, seatNumber);
        Seat updatedSeat = seatService.updateSeatStatus(planeId, seatNumber);
        
        // Convert to clean DTO
        var dto = new java.util.HashMap<String, Object>();
        dto.put("planeId", updatedSeat.getPlaneId());
        dto.put("seatNumber", updatedSeat.getSeatNumber());
        dto.put("type", updatedSeat.getType().toString());
        dto.put("status", updatedSeat.getStatus().toString());
        
        logger.info("Updated seat {} to status: {}", seatNumber, updatedSeat.getStatus());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/flights/{flightId}/cancel")
    public ResponseEntity<String> cancelFlight(@PathVariable Long flightId) {
        logger.info("POST /api/admin/flights/{}/cancel called", flightId);
        try {
            String result = flightService.cancelFlight(flightId);
            logger.info("Flight cancellation result: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error cancelling flight {}: {}", flightId, e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }
}