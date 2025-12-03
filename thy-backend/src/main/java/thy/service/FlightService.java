package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.dto.FlightCreateRequestDTO;
import thy.dto.FlightSearchRequestDTO;
import thy.dto.FlightSearchResultDTO;
import thy.entity.Airport;
import thy.entity.Flight;
import thy.entity.Plane;
import thy.entity.Ticket;
import thy.repository.AirportRepository;
import thy.repository.FlightRepository;
import thy.repository.PlaneRepository;
import thy.repository.TicketRepository;
import thy.util.DTOMapper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightService {

    // MEVCUT REPOSITORY
    private final FlightRepository flightRepository;
    private final PlaneRepository planeRepository;
    private final AirportRepository airportRepository;
    private final FlightSeatService flightSeatService;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    // flight searching service
    public List<FlightSearchResultDTO> searchFlights(FlightSearchRequestDTO flightSearchRequestDTO) {

        LocalDateTime startOfDay;
        LocalDateTime endOfDay;

        if (flightSearchRequestDTO.getDate() != null) {
            startOfDay = flightSearchRequestDTO.getDate().atStartOfDay();
            endOfDay = startOfDay.plusDays(1);
        } else {
            // If date is not provided, search from now to +1 day
            startOfDay = LocalDateTime.now();
            endOfDay = startOfDay.plusDays(1);
        }

        return flightRepository.searchFlights(
                flightSearchRequestDTO.getOrigin(),
                flightSearchRequestDTO.getDestination(),
                startOfDay,
                endOfDay
        ).stream().map(DTOMapper::toFlightSearchResultDTO).toList();
    }

    @Transactional
    public void createFlight(FlightCreateRequestDTO request) {

        // 1. Varlıkları Bul ve Doğrula
        Plane plane = planeRepository.findById(request.getPlaneId())
                .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + request.getPlaneId()));

        Airport origin = airportRepository.findById(request.getOriginAirportId())
                .orElseThrow(() -> new RuntimeException("Origin Airport not found with ID: " + request.getOriginAirportId()));

        Airport dest = airportRepository.findById(request.getDestinationAirportId())
                .orElseThrow(() -> new RuntimeException("Destination Airport not found with ID: " + request.getDestinationAirportId()));

        // 2. Süreyi Hesapla (Fiyatlandırma için lazım)
        long durationMinutes = Duration.between(request.getDepartureTime(), request.getArrivalTime()).toMinutes();
        double durationHours = durationMinutes / 60.0;

        if (durationHours <= 0) {
            throw new RuntimeException("Arrival time must be after departure time");
        }

        // 3. Uçuşu (Flight) Kaydet
        Flight flight = new Flight();
        flight.setPlane(plane);
        flight.setOriginAirport(origin);
        flight.setDestinationAirport(dest);
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());

        Flight savedFlight = flightRepository.save(flight);

        // 4. İŞİ DEVRET: Koltukları oluşturması ve fiyatlandırması için FlightSeatService'i çağır
        flightSeatService.createFlightSeatsForFlight(
                savedFlight,
                request.getBasePricePerHour(),
                durationHours
        );
    }

    @Transactional
    public String cancelFlight(Long flightId) {

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found."));

        // Eğer zaten iptal edilmişse uyarı dön
        // DÜZELTİLDİ: Flight.FlightStatus kullanılıyor.
        if (flight.getStatus() == Flight.FlightStatus.CANCELLED) {
            return "Flight is already cancelled.";
        }

        // 1. İptal Edilecek Tüm Biletleri Bul
        // Burayı senin repository'ndeki metodun adıyla çağırıyoruz:
        List<Ticket> tickets = ticketRepository.findByFlightId(flightId);

        if (tickets.isEmpty()) {
            // Eğer bilet yoksa, sadece uçuşu iptal et
            // DÜZELTİLDİ: Flight.FlightStatus.CANCELLED kullanılıyor.
            flight.setStatus(Flight.FlightStatus.CANCELLED);
            flightRepository.save(flight);
            return "Flight cancelled. No tickets were sold.";
        }

        // 2. TicketService'i Kullanarak İptal Zincirini Başlat
        int ticketsCancelled = 0;

        for (Ticket ticket : tickets) {
            // TicketService.cancelTicket zaten FlightSeat'i boşaltma, mil iadesi ve
            // Payment kaydı oluşturma işlemlerini yaptığı için sadece onu çağırıyoruz.
            try {
                // ticketService.cancelTicket metodu içinde Ticket'ın durumu kontrol edilir.
                ticketService.cancelTicket(ticket.getTicketId());
                ticketsCancelled++;
            } catch (RuntimeException e) {
                // Zaten iptal edilmiş veya tamamlanmış biletleri atla, ama logla.
                System.err.println("Could not cancel ticket " + ticket.getTicketId() + ": " + e.getMessage());
            }
        }

        // 3. Flight Statusunu Güncelle (En Son Adım)
        // DÜZELTİLDİ: Flight.FlightStatus.CANCELLED kullanılıyor.
        flight.setStatus(Flight.FlightStatus.CANCELLED);
        flightRepository.save(flight);

        return String.format("Flight %d cancelled successfully. %d tickets were processed for refund.",
                flightId, ticketsCancelled);
    }
}