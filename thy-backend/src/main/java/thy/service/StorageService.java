package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.dto.PlaneRequestDTO;
import thy.entity.Plane;
import thy.entity.Plane.PlaneStatus;
import thy.repository.PlaneRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final PlaneRepository planeRepository;
    private final SeatService seatService; // Koltuk oluşturma görevini devralır

    /**
     * UÇAK YARATMA (CREATE): Uçağı depoya (airport=NULL) kaydeder ve koltuklarını oluşturur.
     */
    @Transactional
    public Plane addPlane(PlaneRequestDTO request) {

        // 1. Uçağı Oluştur (Konum = NULL)
        Plane plane = new Plane();
        plane.setModelType(request.getModelType());
        plane.setStatus(PlaneStatus.active); // Depoda 'aktif' bekler
        plane.setAirport(null); // ZORUNLU: Depo olduğu için havalimanı NULL

        // Request'ten gelen airportId bilgisini ignore ediyoruz (Çünkü amaç depoya çekmek)

        // 2. Kaydet
        Plane savedPlane = planeRepository.save(plane);

        // 3. Koltukları Oluşturma (İşi SeatService'e devret)
        seatService.createSeatsForPlane(savedPlane, request.getModelType());

        return savedPlane;
    }

    /**
     * UÇAK SİLME (DELETE): Uçağı veritabanından siler.
     * Not: SQL kısıtlaması (Flight FK) nedeniyle, atanmış uçuşu varsa bu işlem başarısız olur.
     */
    @Transactional
    public void deletePlane(Long planeId) {

        Optional<Plane> planeOptional = planeRepository.findById(planeId);
        if (planeOptional.isEmpty()) {
            throw new RuntimeException("Plane not found.");
        }

        Plane plane = planeOptional.get();

        // Operasyonel Kontrol: Atanmış uçuşu var mı kontrolü FlightService'de yapılmalı.
        // Eğer varsa, veritabanı kısıtlaması (RESTRICT) zaten silmeyi engelleyecektir.

        planeRepository.delete(plane);
    }
}