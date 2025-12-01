package thy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.UserDTO;
import thy.dto.CreditCardRequestDTO;
import thy.dto.CreditCardResultDTO;
import thy.dto.ChangePasswordRequestDTO;
import thy.service.UserService;
import thy.service.CreditCardService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CreditCardService creditCardService;

    @GetMapping("/{emailOrPhoneNum}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String emailOrPhoneNum) {
        UserDTO user = userService.getUserByEmailOrPhoneNum(emailOrPhoneNum);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody UserDTO userDTO) {
        userDTO.setUserId(userId);
        UserDTO updated = userService.updateUser(userDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<UserDTO> deleteUser(@PathVariable Long userId) {
        UserDTO deleted = userService.deleteUser(userId);
        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/{userId}/credit-cards")
    public ResponseEntity<List<CreditCardResultDTO>> getUserCreditCards(@PathVariable Long userId) {
        List<CreditCardResultDTO> cards = creditCardService.getCreditCardsByUserId(userId);
        return ResponseEntity.ok(cards);
    }

    @PostMapping("/{userId}/credit-cards")
    public ResponseEntity<Void> addCreditCard(@PathVariable Long userId, @RequestBody CreditCardRequestDTO cardDTO) {
        userService.addCardToUser(userId, cardDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/credit-cards/{cardId}")
    public ResponseEntity<Void> deleteCreditCard(@PathVariable Long userId, @PathVariable Long cardId) {
        userService.removeCardFromUser(userId, cardId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long userId, @Valid @RequestBody ChangePasswordRequestDTO request) {
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
