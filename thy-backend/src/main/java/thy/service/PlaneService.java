package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.entity.Airport;
import thy.entity.Flight;
import thy.entity.Plane;
import thy.entity.Ticket;
import thy.repository.AirportRepository;
import thy.repository.FlightRepository;
import thy.repository.PlaneRepository;
import thy.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaneService {

    private static final Logger logger = LoggerFactory.getLogger(PlaneService.class);

    private final PlaneRepository planeRepository;
    private final AirportRepository airportRepository;
    private final FlightRepository flightRepository;
    private final TicketService ticketService;
    private final TicketRepository ticketRepository;

    // Koltuk yaratma işini devredeceğimiz servis
    private final SeatService seatService;

    /**
     * Get all planes from the database
     */
    public List<Plane> getAllPlanes() {
        return planeRepository.findAll();
    }

    /**
     * Get planes by airport ID
     */
    public List<Plane> getPlanesByAirport(Long airportId) {
        return planeRepository.findByAirportAirportId(airportId);
    }

    @Transactional
    public String deployPlaneToAirport(Long planeId, Long airportId) {
        logger.info("=== DEPLOY PLANE TO AIRPORT ===");
        logger.info("Plane ID: {}, Airport ID: {}", planeId, airportId);

        Plane plane = planeRepository.findById(planeId)
                .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + planeId));

        logger.info("Found plane: {} ({}), Current Status: {}, Current Airport: {}", 
            plane.getPlaneId(), 
            plane.getModelType(), 
            plane.getStatus(),
            plane.getAirport() != null ? plane.getAirport().getName() : "Storage");

        // Check if plane can be deployed (only active planes)
        if (plane.getStatus() != Plane.PlaneStatus.active) {
            logger.warn("Cannot deploy plane {} - status is {}", planeId, plane.getStatus());
            throw new RuntimeException("Only active planes can be deployed. Current status: " + plane.getStatus());
        }

        // Get airport
        Airport airport = airportRepository.findById(airportId)
                .orElseThrow(() -> new RuntimeException("Airport not found with ID: " + airportId));

        logger.info("Deploying plane {} to airport {} ({})", planeId, airport.getName(), airport.getIataCode());

        // Update plane's airport
        plane.setAirport(airport);
        planeRepository.saveAndFlush(plane);
        
        logger.info("Plane {} successfully deployed to airport {} with status {}", 
            planeId, airportId, plane.getStatus());
        
        String statusNote = plane.getStatus() == Plane.PlaneStatus.active ? 
            "" : " (Note: Plane is in " + plane.getStatus() + " status)";
        
        return String.format("Plane %d (%s) successfully deployed to %s (%s)%s",
            planeId, plane.getModelType(), airport.getName(), airport.getIataCode(), statusNote);
    }

    @Transactional
    public String togglePlaneStatus(Long planeId) {
        logger.info("=== TOGGLE PLANE STATUS ===");
        logger.info("Plane ID: {}", planeId);

        Plane plane = planeRepository.findById(planeId)
                .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + planeId));

        logger.info("Current Status: {}", plane.getStatus());

        // Cannot reactivate retired planes
        if (plane.getStatus() == Plane.PlaneStatus.retired) {
            logger.warn("Cannot reactivate retired plane {}", planeId);
            throw new RuntimeException("Cannot reactivate a retired plane");
        }

        // Toggle between active and maintenance
        if (plane.getStatus() == Plane.PlaneStatus.active) {
            // Send to maintenance (cancel flights) - call directly
            logger.info("Sending plane {} to maintenance", planeId);
            
            // 1. Find and cancel all flights
            List<Flight> allFlights = flightRepository.findByPlanePlaneId(planeId);
            logger.info("Found {} total flights for plane {}", allFlights.size(), planeId);

            int flightsCancelled = 0;
            int ticketsCancelled = 0;

            for (Flight flight : allFlights) {
                if (flight.getStatus() == Flight.FlightStatus.SCHEDULED ||
                        flight.getStatus() == Flight.FlightStatus.ACTIVE) {

                    List<Ticket> tickets = ticketRepository.findByFlightId(flight.getFlightId());
                    logger.info("Found {} tickets for Flight {}", tickets.size(), flight.getFlightId());

                    for (Ticket ticket : tickets) {
                        try {
                            if (ticket.getStatus() != Ticket.TicketStatus.cancelled &&
                                ticket.getStatus() != Ticket.TicketStatus.completed) {
                                ticketService.cancelTicket(ticket.getTicketId());
                                ticketsCancelled++;
                            }
                        } catch (RuntimeException e) {
                            logger.error("Error cancelling ticket {}: {}", ticket.getTicketId(), e.getMessage());
                        }
                    }

                    flight.setStatus(Flight.FlightStatus.CANCELLED);
                    flightRepository.save(flight);
                    flightsCancelled++;
                }
            }

            // 2. Update plane status
            String previousLocation = plane.getAirport() != null ? 
                plane.getAirport().getName() + " (" + plane.getAirport().getIataCode() + ")" : 
                "Storage";
            logger.info("Setting plane {} status from {} to maintenance", planeId, plane.getStatus());
            plane.setStatus(Plane.PlaneStatus.maintenance);
            plane.setAirport(null);
            Plane savedPlane = planeRepository.saveAndFlush(plane);
            logger.info("Plane {} saved with new status: {}", planeId, savedPlane.getStatus());

            logger.info("Plane {} sent to maintenance successfully", planeId);
            return String.format(
                "Plane %d (%s) sent to maintenance and moved to Storage.\n" +
                "Previous Location: %s\n" +
                "Flights Cancelled: %d\n" +
                "Tickets Refunded: %d",
                planeId, plane.getModelType(), previousLocation, flightsCancelled, ticketsCancelled);

        } else if (plane.getStatus() == Plane.PlaneStatus.maintenance) {
            // Reactivate plane - move back to storage as active
            logger.info("Reactivating plane {} from maintenance to active", planeId);
            plane.setStatus(Plane.PlaneStatus.active);
            // Keep in storage - admin can assign to airport later
            Plane savedPlane = planeRepository.saveAndFlush(plane);
            logger.info("Plane {} saved with new status: {}", planeId, savedPlane.getStatus());
            return String.format("Plane %d (%s) has been reactivated and is ready for service in Storage.",
                planeId, plane.getModelType());
        }

        logger.error("Invalid plane status for plane {}: {}", planeId, plane.getStatus());
        throw new RuntimeException("Invalid plane status: " + plane.getStatus());
    }

    @Transactional
    public String reportMalfunction(Long planeId, boolean isRetired) {

        logger.info("=== MALFUNCTION REPORT STARTED ===");
        logger.info("Plane ID: {}, Retire: {}", planeId, isRetired);

        Plane plane = planeRepository.findById(planeId)
                .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + planeId));

        logger.info("Found plane: {} ({}), Current Status: {}, Current Location: {}", 
            plane.getPlaneId(), 
            plane.getModelType(), 
            plane.getStatus(),
            plane.getAirport() != null ? plane.getAirport().getName() : "Storage");

        // Check if plane is already retired
        if (plane.getStatus() == Plane.PlaneStatus.retired) {
            logger.warn("Plane {} is already retired", planeId);
            throw new RuntimeException("Plane is already retired");
        }

        // 1. Find all flights associated with this plane
        List<Flight> allFlights = flightRepository.findByPlanePlaneId(planeId);
        logger.info("Found {} total flights for plane {}", allFlights.size(), planeId);

        int flightsCancelled = 0;
        int ticketsCancelled = 0;

        // 2. Cancel each active or scheduled flight
        for (Flight flight : allFlights) {
            logger.info("Processing Flight {}: Status = {}, Departure = {}", 
                flight.getFlightId(), flight.getStatus(), flight.getDepartureTime());

            // Only cancel if flight is SCHEDULED or ACTIVE (not already CANCELLED or COMPLETED)
            if (flight.getStatus() == Flight.FlightStatus.SCHEDULED ||
                    flight.getStatus() == Flight.FlightStatus.ACTIVE) {

                // Find all tickets for this flight
                List<Ticket> tickets = ticketRepository.findByFlightId(flight.getFlightId());
                logger.info("Found {} tickets for Flight {}", tickets.size(), flight.getFlightId());

                // Cancel each ticket (this triggers refund and seat availability update)
                for (Ticket ticket : tickets) {
                    try {
                        // Only cancel if ticket is not already cancelled or completed
                        if (ticket.getStatus() != Ticket.TicketStatus.cancelled &&
                            ticket.getStatus() != Ticket.TicketStatus.completed) {
                            logger.info("Cancelling Ticket {} (Status: {})", ticket.getTicketId(), ticket.getStatus());
                            ticketService.cancelTicket(ticket.getTicketId());
                            ticketsCancelled++;
                        } else {
                            logger.info("Skipping Ticket {} (Already {})", ticket.getTicketId(), ticket.getStatus());
                        }
                    } catch (RuntimeException e) {
                        // Log error but continue with other tickets
                        logger.error("Error cancelling ticket {}: {}", ticket.getTicketId(), e.getMessage());
                    }
                }

                // Cancel the flight
                flight.setStatus(Flight.FlightStatus.CANCELLED);
                flightRepository.save(flight);
                flightsCancelled++;
                logger.info("Flight {} cancelled successfully", flight.getFlightId());
            } else {
                logger.info("Skipping Flight {} (Already {})", flight.getFlightId(), flight.getStatus());
            }
        }

        // 3. Update plane status (Maintenance or Retired)
        Plane.PlaneStatus newStatus = isRetired ? Plane.PlaneStatus.retired : Plane.PlaneStatus.maintenance;
        plane.setStatus(newStatus);
        logger.info("Setting plane {} status to {}", planeId, newStatus);

        // 4. Move plane to storage (set airport to null)
        String previousLocation = plane.getAirport() != null ? 
            plane.getAirport().getName() + " (" + plane.getAirport().getIataCode() + ")" : 
            "Storage";
        plane.setAirport(null);
        logger.info("Moving plane {} from {} to Storage", planeId, previousLocation);

        planeRepository.save(plane);

        logger.info("=== MALFUNCTION REPORT COMPLETED ===");
        logger.info("Summary - Flights Cancelled: {}, Tickets Refunded: {}", flightsCancelled, ticketsCancelled);

        String result = String.format(
            "Plane %d (%s) reported as malfunction and moved to Storage.\n" +
            "Status: %s\n" +
            "Previous Location: %s\n" +
            "Flights Cancelled: %d\n" +
            "Tickets Refunded: %d\n" +
            "All affected passengers will receive full refunds.",
            planeId, 
            plane.getModelType(),
            newStatus.name().toUpperCase(), 
            previousLocation,
            flightsCancelled,
            ticketsCancelled
        );
        
        return result;
    }
}