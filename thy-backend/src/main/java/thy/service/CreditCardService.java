package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.CreditCardRepository;

@Service
@RequiredArgsConstructor
public class CreditCardService {
    
    public final CreditCardRepository creditCardRepository;
}
