package thy.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import thy.dto.CreditCardRequestDTO;
import thy.dto.UserDTO;
import thy.entity.CreditCard;
import thy.entity.User;
import thy.entity.User.Gender;
import thy.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CreditCardService creditCardService;

    public UserDTO getUserByEmailOrPhoneNum(String emailOrPhoneNum) {

        return userRepository.findByEmailOrPhoneNum(emailOrPhoneNum, emailOrPhoneNum)   // either email or phone number
            .map(this::convertToUserDTO)
            .orElse(null);
    }

    @Transactional
    public UserDTO updateUser(UserDTO userDTO) {

        User user = userRepository.findById(userDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDTO.getFirstName());
        user.setMiddleName(userDTO.getMiddleName());
        user.setLastName(userDTO.getLastName());
        user.setDateOfBirth(userDTO.getDateOfBirth());
        user.setGender(Gender.valueOf(userDTO.getGender()));
        user.setNationality(userDTO.getNationality());
        user.setEmail(userDTO.getEmail());
        //user.setPassword(userDTO.getPassword());
        user.setPhoneNum(userDTO.getPhoneNum());

        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    @Transactional
    public UserDTO deleteUser(Long userId) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
        return convertToUserDTO(user);
    }

    @Transactional
    public void addCardToUser(Long userId,  CreditCardRequestDTO creditCardDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CreditCard creditCard = creditCardService.findOrCreateCreditCard(creditCardDTO);
        // Ensure the card is associated to this user in the new OneToMany/ManyToOne model
        creditCard.setUser(user);
        if (!user.getCreditCards().contains(creditCard)) {
            user.getCreditCards().add(creditCard);
        }
    
        userRepository.save(user);
    }

    @Transactional
    public void removeCardFromUser(Long userId, String cardNum) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CreditCard creditCard = user.getCreditCards().stream()
            .filter(card -> card.getCardNum().equals(cardNum))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Credit card not found for user"));

        user.getCreditCards().remove(creditCard);
        // Since each credit card belongs to a single user (user_id in PK),
        // deleting association implies deleting the credit card itself.

        // delete the user to credit card association
        userRepository.save(user);

        // delete the credit card record
        creditCardService.deleteCreditCard(creditCard);
    }

    private UserDTO convertToUserDTO(User user) {
        return new UserDTO(
            user.getUserId(),
            user.getFirstName(),
            user.getMiddleName(),
            user.getLastName(),
            user.getDateOfBirth(),
            user.getGender().name(),
            user.getNationality(),
            user.getEmail(),
            user.getPhoneNum(),
            user.getUserType().name(),
            user.getMile()
        );
    }
}
