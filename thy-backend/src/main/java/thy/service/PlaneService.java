package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.entity.Flight;
import thy.entity.Plane;
import thy.entity.Ticket;
import thy.repository.FlightRepository;
import thy.repository.PlaneRepository;
import thy.repository.TicketRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaneService {

    private final PlaneRepository planeRepository;
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

    @Transactional
    public String reportMalfunction(Long planeId, boolean isRetired) {

        Plane plane = planeRepository.findById(planeId)
                .orElseThrow(() -> new RuntimeException("Plane not found with ID: " + planeId));

        // 1. Uçağın tüm uçuşlarını bul
        // Aktif/planlanmış uçuşlar varsa iptal etmeliyiz
        List<Flight> flightsToCancel = flightRepository.findByPlanePlaneId(planeId);

        int flightsCancelled = 0;

        // 2. Her Uçuş İçin İptal Zincirini Başlat
        for (Flight flight : flightsToCancel) {
            // Eğer uçuş zaten iptal veya tamamlanmış değilse
            if (flight.getStatus() == Flight.FlightStatus.SCHEDULED ||
                    flight.getStatus() == Flight.FlightStatus.ACTIVE) {

                // FlightService'de bu metodu çağıran bir metot yok,
                // bu yüzden TicketService.cancelTicket'ı kullanacağız.

                // Uçuştaki tüm biletleri bul (TicketService'in yapısına uygun olarak)
                List<Ticket> tickets = ticketRepository.findByFlightId(flight.getFlightId());

                for (Ticket ticket : tickets) {
                    // Tek tek biletleri iptal et (Bu, iade ve FlightSeat boşaltma işlemlerini tetikler)
                    ticketService.cancelTicket(ticket.getTicketId());
                }

                // Uçuşu iptal et
                flight.setStatus(Flight.FlightStatus.CANCELLED);
                flightRepository.save(flight);
                flightsCancelled++;
            }
        }

        // 3. Uçağın Kendi Statüsünü Güncelle (Bakıma Çekme)
        Plane.PlaneStatus newStatus = isRetired ? Plane.PlaneStatus.retired : Plane.PlaneStatus.maintenance;
        plane.setStatus(newStatus);

        // 4. Uçağı Depoya Al (Havalimanı ID'sini NULL yap)
        plane.setAirport(null);

        planeRepository.save(plane);

        return String.format("Plane %d reported as malfunction. Status set to %s and moved to Storage. Total %d flights were cancelled and refunded.",
                planeId, newStatus.name(), flightsCancelled);
    }
}