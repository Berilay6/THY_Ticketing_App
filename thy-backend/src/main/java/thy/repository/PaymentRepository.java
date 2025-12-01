package thy.repository;

import thy.entity.Payment;
import thy.entity.Payment.PaymentStatus;
import thy.entity.Payment.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.tickets t " +
           "LEFT JOIN FETCH t.flight f " +
           "LEFT JOIN FETCH f.originAirport " +
           "LEFT JOIN FETCH f.destinationAirport " +
           "WHERE p.user.userId = :userId")
    List<Payment> findByUserUserId(@Param("userId") Long userId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByMethod(PaymentMethod method);
}
