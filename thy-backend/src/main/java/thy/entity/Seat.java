package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Seat")
@IdClass(SeatId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @Column(name = "plane_id")
    private Long planeId;

    @Id
    @Column(name = "seat_number", length = 3)
    private String seatNumber;

    public enum SeatType {
        economy,
        premium_economy,
        business,
        first
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private SeatType type;

    public enum SeatStatus {
        active,
        unavailable
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SeatStatus status = SeatStatus.active;

    @ManyToOne
    @JoinColumn(name = "plane_id", insertable = false, updatable = false)
    private Plane plane;


}
