package thy.util;

import thy.entity.Seat;
import thy.entity.FlightSeat;
import thy.entity.User;
import thy.repository.UserRepository;

import java.util.List;

/**
 * Utility class for calculating and managing user miles based on seat types and prices.
 */
public class MilesCalculator {
    
    /**
     * Get status multiplier based on seat type
     * economy: 5%
     * premium_economy: 10%
     * business: 15%
     * first: 20%
     */
    public static int getStatusMultiplier(Seat.SeatType seatType) {
        return switch (seatType) {
            case economy -> 5;
            case premium_economy -> 10;
            case business -> 15;
            case first -> 20;
        };
    }

    /**
     * Calculate miles to be awarded for a single flight seat
     * Formula: price * statusMultiplier / 100
     */
    public static int calculateMilesForSeat(FlightSeat flightSeat) {
        if (flightSeat.getPrice() == null || flightSeat.getFlight() == null || 
            flightSeat.getFlight().getPlane() == null) {
            return 0;
        }
        
        // Get seat info from Plane's seats
        Seat seat = flightSeat.getFlight().getPlane().getSeats().stream()
            .filter(s -> s.getSeatNumber().equals(flightSeat.getSeatNumber()))
            .findFirst()
            .orElse(null);
        
        if (seat == null || seat.getType() == null) {
            return 0;
        }
        
        double price = flightSeat.getPrice().doubleValue();
        int statusMultiplier = getStatusMultiplier(seat.getType());
        return (int) Math.round((price * statusMultiplier) / 100.0);
    }

    /**
     * Award miles to user for a list of flight seats
     */
    public static void awardMiles(User user, List<FlightSeat> seats, UserRepository userRepository) {
        int totalMilesToAward = seats.stream()
            .mapToInt(MilesCalculator::calculateMilesForSeat)
            .sum();
        
        if (totalMilesToAward > 0) {
            Integer currentMiles = user.getMile() != null ? user.getMile() : 0;
            user.setMile(currentMiles + totalMilesToAward);
            userRepository.save(user);
        }
    }

    /**
     * Deduct miles from user for a single flight seat (e.g., when cancelling)
     */
    public static void deductMiles(User user, FlightSeat flightSeat, UserRepository userRepository) {
        int milesToDeduct = calculateMilesForSeat(flightSeat);
        
        if (milesToDeduct > 0) {
            Integer currentMiles = user.getMile() != null ? user.getMile() : 0;
            // Ensure miles don't go negative
            user.setMile(Math.max(0, currentMiles - milesToDeduct));
            userRepository.save(user);
        }
    }
}
