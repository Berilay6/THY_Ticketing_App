package thy.repository;

import thy.entity.CreditCard;
import thy.entity.CreditCardId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditCardRepository extends JpaRepository<CreditCard, CreditCardId> {

    List<CreditCard> findByUserId(Long userId);

    boolean existsByUserIdAndCardNum(Long userId, String cardNum);
}
