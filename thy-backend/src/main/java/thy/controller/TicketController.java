package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.TicketSummaryDTO;
import thy.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<TicketSummaryDTO>> getUserTickets(@PathVariable Long userId) {
		List<TicketSummaryDTO> tickets = ticketService.getUserTickets(userId);
		return ResponseEntity.ok(tickets);
	}

	@PostMapping("/{ticketId}/cancel")
	public ResponseEntity<TicketSummaryDTO> cancelTicket(@PathVariable Long ticketId) {
		TicketSummaryDTO dto = ticketService.cancelTicket(ticketId);
		if (dto == null) return ResponseEntity.notFound().build();
		return ResponseEntity.ok(dto);
	}

	@PostMapping("/{ticketId}/checkin")
	public ResponseEntity<TicketSummaryDTO> checkInTicket(@PathVariable Long ticketId) {
		TicketSummaryDTO dto = ticketService.checkInTicket(ticketId);
		if (dto == null) return ResponseEntity.notFound().build();
		return ResponseEntity.ok(dto);
	}
}
