package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.PaymentRequestDTO;
import thy.dto.PaymentResultDTO;
import thy.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

	private final PaymentService paymentService;

	public ResponseEntity<?> createPayment(@RequestBody PaymentRequestDTO req) {
    try {
        List<PaymentResultDTO> result = paymentService.createPayment(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("The seat you chose is not available");
    }
}

	// Get payment history for a user
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<PaymentResultDTO>> getUserPayments(@PathVariable Long userId) {
		List<PaymentResultDTO> history = paymentService.userPaymentHistory(userId);
		return ResponseEntity.ok(history);
	}
}
