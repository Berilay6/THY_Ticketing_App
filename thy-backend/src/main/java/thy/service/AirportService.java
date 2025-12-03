package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.dto.AirportRequestDTO;
import thy.entity.Airport;
import thy.entity.Flight;
import thy.entity.Plane;
import thy.repository.AirportRepository;
import thy.repository.FlightRepository;
import thy.repository.PlaneRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AirportService {

    private final AirportRepository airportRepository;
    private final FlightRepository flightRepository;
    private final PlaneRepository planeRepository;
    private final FlightService flightService;

    /**
     * Yeni havalimanı kaydı oluşturur ve benzersizliğini kontrol eder.
     */
    @Transactional
    public Airport addAirport(AirportRequestDTO request) {

        // 1. Doğrulama: IATA kodunun zaten kullanılıp kullanılmadığını kontrol et
        if (airportRepository.findByIataCode(request.getIataCode()).isPresent()) {
            throw new RuntimeException("IATA code " + request.getIataCode() + " is already in use.");
        }

        // 2. Entity'i oluştur
        Airport airport = new Airport();

        // 3. DTO'dan gelen veriyi Entity'ye set et
        // Bu metotlar Lombok @Setter tarafından oluşturulmuştur ve Entity'de mevcuttur.
        airport.setIataCode(request.getIataCode().toUpperCase());
        airport.setName(request.getName());
        airport.setCity(request.getCity());
        airport.setCountry(request.getCountry());
        airport.setTimezone(request.getTimezone());

        // 4. Kaydet ve geri dön
        // NOT: is_active set edilmediği için, eğer SQL'de bu kolon varsa,
        // varsayılan (DEFAULT TRUE) değeri veritabanı atayacaktır.
        return airportRepository.save(airport);
    }

    @Transactional // Tüm adımlar tek bir işlemde gerçekleşmelidir
    public void deleteAirport(Long airportId) {

        Airport airport = airportRepository.findById(airportId)
                .orElseThrow(() -> new RuntimeException("Airport not found with ID: " + airportId));

        // --- 1. TÜM İLGİLİ UÇUŞLARI BUL VE İPTAL ET (Refund) ---

        List<Flight> relatedFlights = flightRepository.findByOriginAirportAirportIdOrDestinationAirportAirportId(
                airportId,
                airportId // Aynı ID'yi hem Origin hem Dest için kullanıyoruz
        );

        for (Flight flight : relatedFlights) {
            // FlightService.cancelFlight'ı çağır. Bu metot zaten bileti, FlightSeat'i,
            // iadeyi ve Flight Statusunu (CANCELLED) güncellemeyi hallediyor.
            if (flight.getStatus() != Flight.FlightStatus.CANCELLED && flight.getStatus() != Flight.FlightStatus.COMPLETED) {
                flightService.cancelFlight(flight.getFlightId());
            }
        }

        // --- 2. TÜM UÇAKLARI DEPOYA ÇEK (Airport ID'sini NULL yap) ---

        List<Plane> parkedPlanes = planeRepository.findByAirportAirportId(airportId);

        for (Plane plane : parkedPlanes) {
            plane.setAirport(null); // Depoya çek (Storage)
            planeRepository.save(plane);
        }

        // --- 3. HAVALİMANINI SİL (En Son Adım) ---

        // Uçuş ve Uçak bağlantıları kesildiği için SQL kısıtlaması artık izin verecektir.
        airportRepository.delete(airport);
    }
}