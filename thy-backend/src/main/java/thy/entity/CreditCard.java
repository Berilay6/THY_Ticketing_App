package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CreditCard")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "card_num", nullable = false, length = 16, unique = true)
    private String cardNum;

    @Column(name = "CVV", nullable = false, length = 3)
    private String cvv;

    @Column(name = "expiry_time", nullable = false, length = 5)
    private String expiryTime; // MM/YY

    @Column(name = "holder_name", nullable = false, length = 100)
    private String holderName;

    @ManyToMany(mappedBy = "creditCards")
    private List<User> users = new ArrayList<>();

}
