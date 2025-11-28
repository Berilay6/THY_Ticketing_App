package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatDTO {

	//Seat ve FlightSeat entity birleşimi 
	
    private String seatNumber; // "12A"
    private String type; // economy, business vs.
    private String status;  // seat tablosundaki status: active/broken/unavailable
    private String availability; // FlightSeat tablosundaki availability: available/reserved/sold
    private Double price;  // İleride her koltuğun fiyatı farklı olursa diye
}
