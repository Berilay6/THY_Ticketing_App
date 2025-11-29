package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "CreditCard")
@IdClass(CreditCardId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
	
	 @Id
	 @Column(name = "user_id")
	 private Long userId;

    @Id
    @Column(name = "card_num", length = 16)
    private String cardNum;

    @Column(name = "CVV", nullable = false, length = 3)
    private String cvv;

    @Column(name = "expiry_time", nullable = false, length = 5)
    private String expiryTime; // MM/YY

    @Column(name = "holder_name", nullable = false, length = 100)
    private String holderName;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false, nullable = false)
    private User user;

}
