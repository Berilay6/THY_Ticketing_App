package thy.repository;

import thy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhoneNum(String phoneNum);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNum(String phoneNum);

    Optional<User> findByEmailOrPhoneNum(String email, String phoneNum);
}
