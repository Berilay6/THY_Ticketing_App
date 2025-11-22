package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "Ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    @ManyToOne
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "issue_time", nullable = false)
    private LocalDateTime issueTime;

    @Column(name = "flight_id", nullable = false)
    private Long flightId;

    @Column(name = "seat_number", nullable = false, length = 3)
    private String seatNumber;

    public enum TicketStatus {
        booked,
        cancelled,
        checked_in,
        completed
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private TicketStatus status = TicketStatus.booked;

    @Column(name = "has_extra_baggage", nullable = false)
    private Boolean hasExtraBaggage = false;

    @Column(name = "has_meal_service", nullable = false)
    private Boolean hasMealService = false;

    @OneToOne
    @JoinColumns({
            @JoinColumn(name = "flight_id", referencedColumnName = "flight_id", insertable = false, updatable = false),
            @JoinColumn(name = "seat_number", referencedColumnName = "seat_number", insertable = false, updatable = false)
    })
    private FlightSeat flightSeat;



}
