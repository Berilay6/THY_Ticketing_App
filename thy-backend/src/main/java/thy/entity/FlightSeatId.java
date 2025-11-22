package thy.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class FlightSeatId implements Serializable {
    private Long flightId;
    private String seatNumber;
}
