package thy.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import thy.dto.CreditCardRequestDTO;
import thy.dto.UserDTO;
import thy.entity.CreditCard;
import thy.entity.User;
import thy.entity.User.Gender;
import thy.util.DTOMapper;
import thy.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CreditCardService creditCardService;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getUserByEmailOrPhoneNum(String emailOrPhoneNum) {

        return userRepository.findByEmailOrPhoneNum(emailOrPhoneNum, emailOrPhoneNum)   // either email or phone number
            .map(DTOMapper::toUserDTO)
            .orElse(null);
    }

    @Transactional
    public UserDTO updateUser(UserDTO userDTO) {

        User user = userRepository.findById(userDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Only update non-null fields
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        if (userDTO.getMiddleName() != null) {
            user.setMiddleName(userDTO.getMiddleName());
        }
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        if (userDTO.getDateOfBirth() != null) {
            user.setDateOfBirth(userDTO.getDateOfBirth());
        }
        if (userDTO.getGender() != null) {
            user.setGender(Gender.valueOf(userDTO.getGender()));
        }
        if (userDTO.getNationality() != null) {
            user.setNationality(userDTO.getNationality());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhoneNum() != null) {
            user.setPhoneNum(userDTO.getPhoneNum());
        }

        User updatedUser = userRepository.save(user);
        return DTOMapper.toUserDTO(updatedUser);
    }

    @Transactional
    public UserDTO deleteUser(Long userId) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
        return DTOMapper.toUserDTO(user);
    }

    @Transactional
    public void addCardToUser(Long userId,  CreditCardRequestDTO creditCardDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CreditCard creditCard = creditCardService.findOrCreateCreditCard(creditCardDTO);
        
        if (!user.getCreditCards().contains(creditCard)) {
            user.getCreditCards().add(creditCard);
            creditCard.getUsers().add(user);
        }
    
        userRepository.save(user);
    }

    @Transactional
    public void removeCardFromUser(Long userId, Long cardId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CreditCard creditCard = user.getCreditCards().stream()
            .filter(card -> card.getCardId().equals(cardId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Credit card not found for user"));

        user.getCreditCards().remove(creditCard);
        creditCard.getUsers().remove(user);
        
        userRepository.save(user);
        
        // If no users left, delete the card
        if (creditCard.getUsers().isEmpty()) {
            creditCardService.deleteCreditCard(creditCard);
        }
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
