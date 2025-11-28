package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

	//password, phone_num gibi alanları özellikle dışarıya açmıyoruz.
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String nationality;
    private Integer mile;
    private String userType; // "customer" / "admin"
}
