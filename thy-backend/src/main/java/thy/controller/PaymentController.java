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

	@PostMapping
	public ResponseEntity<List<PaymentResultDTO>> createPayment(@RequestBody PaymentRequestDTO req) {
		List<PaymentResultDTO> result = paymentService.createPayment(req);
		return ResponseEntity.status(HttpStatus.CREATED).body(result);
	}

	// Get payment history for a user
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<PaymentResultDTO>> getUserPayments(@PathVariable Long userId) {
		List<PaymentResultDTO> history = paymentService.userPaymentHistory(userId);
		return ResponseEntity.ok(history);
	}
}
