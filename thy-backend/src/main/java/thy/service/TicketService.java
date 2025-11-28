package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.TicketRepository;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    public final TicketRepository ticketRepository;
}
