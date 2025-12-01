package thy.repository;

import thy.entity.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {

    @Query("SELECT c FROM CreditCard c JOIN c.users u WHERE u.userId = :userId")
    List<CreditCard> findByUserId(@Param("userId") Long userId);

    Optional<CreditCard> findByCardNum(String cardNum);
}
