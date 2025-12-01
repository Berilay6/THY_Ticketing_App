package thy.repository;

import thy.entity.Payment;
import thy.entity.Payment.PaymentStatus;
import thy.entity.Payment.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserUserIdOrderByPaidAtDesc(Long userId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByMethod(PaymentMethod method);
}
