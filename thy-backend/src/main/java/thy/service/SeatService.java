package thy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thy.entity.Plane;
import thy.entity.Seat;
import thy.entity.Seat.SeatStatus;
import thy.entity.Seat.SeatType;
import thy.entity.SeatId;
import thy.repository.SeatRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    /**
     * Bu fonksiyon PlaneService tarafından çağrılır.
     * Uçak modeline göre koltuk haritasını (Şablon) oluşturur ve DB'ye kaydeder.
     */
    @Transactional
    public void createSeatsForPlane(Plane plane, String modelType) {
        List<Seat> seats = new ArrayList<>();

        // --- KONFİGÜRASYON AYARLARI ---
        int totalRows;
        int businessRows; // İlk kaç sıra Business olacak?
        String columnLayout; // Sütun Harfleri (Regex [A-Z] kısmını sağlar)

        String model = modelType.toUpperCase();

        // 1. Modele Göre Düzen Belirle (Custom Logic)
        if (model.contains("737")) {
            // Boeing 737: 30 Sıra. İlk 5 sıra Business. Düzen: ABCDEF
            totalRows = 30;
            businessRows = 5;
            columnLayout = "ABCDEF";
        } else if (model.contains("777")) {
            // Boeing 777 (Geniş): 45 Sıra. İlk 8 sıra Business. Düzen: ABCDEFGHIJ
            totalRows = 45;
            businessRows = 8;
            columnLayout = "ABCDEFGHIJ";
        } else if (model.contains("A320")) {
            // Airbus A320: 28 Sıra. Hepsi Economy.
            totalRows = 28;
            businessRows = 0;
            columnLayout = "ABCDEF";
        } else {
            // Bilinmeyen / Küçük Uçak Standartı
            totalRows = 20;
            businessRows = 2;
            columnLayout = "ACDF"; // 2+2 düzen
        }

        // 2. Koltukları Oluşturma Döngüsü
        // Regex Kuralı: '^[1-9][0-9]{0,1}[A-Z]$' -> Yani 1'den başlamalı, 0 olamaz.
        for (int row = 1; row <= totalRows; row++) {

            for (int i = 0; i < columnLayout.length(); i++) {
                char col = columnLayout.charAt(i); // A, B, C...

                Seat seat = new Seat();

                // --- ID ve İlişki Ayarları ---
                // Composite Key (SeatId) alanları:
                seat.setPlaneId(plane.getPlaneId());
                seat.setSeatNumber(row + String.valueOf(col)); // Örn: "1A", "20F" (Regex'e uygun)

                // İlişki (ManyToOne)
                seat.setPlane(plane);

                // --- Statü ve Tip Ataması ---
                seat.setStatus(SeatStatus.active); // Varsayılan aktif

                // Satır numarasına göre Type belirleme
                if (row <= businessRows) {
                    seat.setType(SeatType.business);
                } else {
                    seat.setType(SeatType.economy);
                }

                seats.add(seat);
            }
        }

        // 3. Hepsini Veritabanına Kaydet (Batch Insert)
        seatRepository.saveAll(seats);
    }

    @Transactional
    public Seat updateSeatStatus(Long planeId, String seatNumber) {

        // 1. Seat'i bulmak için Composite Key'i (SeatId) oluştur
        SeatId id = new SeatId(planeId, seatNumber);

        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber + " on Plane " + planeId));

        // 2. Durumu tersine çevir (Toggle)
        if (seat.getStatus() == SeatStatus.active) {
            seat.setStatus(SeatStatus.unavailable);
        } else {
            seat.setStatus(SeatStatus.active);
        }

        // 3. Kaydet
        return seatRepository.save(seat);
    }
}