package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.PaymentRepository;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    public final PaymentRepository paymentRepository;
}
