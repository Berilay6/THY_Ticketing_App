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

    /**
     * Tüm havalimanlarını döndürür
     */
    public List<Airport> getAllAirports() {
        return airportRepository.findAll();
    }

    /**
     * ID ile havalimanı getirir
     */
    public Airport getAirportById(Long airportId) {
        return airportRepository.findById(airportId)
                .orElseThrow(() -> new RuntimeException("Airport not found with ID: " + airportId));
    }

    @Transactional // Tüm adımlar tek bir işlemde gerçekleşmelidir
    public void clearAirport(Long airportId) {

        // Havalimanının var olduğunu kontrol et
        airportRepository.findById(airportId)
                .orElseThrow(() -> new RuntimeException("Airport not found with ID: " + airportId));

        // --- 1. TÜM İLGİLİ UÇUŞLARI BUL VE İPTAL ET (Refund) ---

        List<Flight> relatedFlights = flightRepository.findByOriginAirportAirportIdOrDestinationAirportAirportId(
                airportId,
                airportId // Aynı ID'yi hem Origin hem Dest için kullanıyoruz
        );

        // Tüm uçuşları iptal et (status = CANCELLED, bilet iadesi, FlightSeat boşalt)
        for (Flight flight : relatedFlights) {
            if (flight.getStatus() != Flight.FlightStatus.CANCELLED && flight.getStatus() != Flight.FlightStatus.COMPLETED) {
                flightService.cancelFlight(flight.getFlightId());
            }
        }

        // --- 2. UÇUŞLARDA KULLANILAN UÇAKLARI DEPOYA ÇEK ---
        // İptal edilen uçuşlardaki uçakları da Storage'a almalıyız
        for (Flight flight : relatedFlights) {
            Plane plane = flight.getPlane();
            if (plane != null && plane.getAirport() != null) {
                plane.setAirport(null); // Depoya çek (Storage)
                planeRepository.save(plane);
            }
        }

        // --- 3. HAVALİMANINDA PARK HALİNDEKİ DİĞER UÇAKLARI DEPOYA ÇEK ---
        List<Plane> parkedPlanes = planeRepository.findByAirportAirportId(airportId);
        for (Plane plane : parkedPlanes) {
            plane.setAirport(null); // Depoya çek (Storage)
            planeRepository.save(plane);
        }

        // Airport silmiyoruz - sadece temizliyoruz
    }
}