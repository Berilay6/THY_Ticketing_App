package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "FlightSeat")
@IdClass(FlightSeatId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlightSeat {

    @Id
    @Column(name = "flight_id")
    private Long flightId;

    @Id
    @Column(name = "seat_number", length = 3)
    private String seatNumber;

    public enum Availability {
        available,
        reserved,
        sold
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "availability", nullable = false, length = 10)
    private Availability availability = Availability.available;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "flight_id", insertable = false, updatable = false)
    private Flight flight;

}
