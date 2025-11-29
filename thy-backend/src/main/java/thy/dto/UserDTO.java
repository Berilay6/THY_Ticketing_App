package thy.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;          // "M" / "F" / "O"
    private String nationality;
    private String email;
    private String phoneNum;
    private String userType;        // optional: for result responses
    private Integer mile;           // optional: for result responses
}
