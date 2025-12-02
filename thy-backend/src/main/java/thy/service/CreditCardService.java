package thy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import thy.dto.CreditCardRequestDTO;
import thy.dto.CreditCardResultDTO;
import thy.entity.CreditCard;
import thy.util.DTOMapper;
import thy.repository.CreditCardRepository;

@Service
@RequiredArgsConstructor
public class CreditCardService {
    
    private final CreditCardRepository creditCardRepository;

    public List<CreditCardResultDTO> getCreditCardsByUserId(Long userId) {
        return creditCardRepository.findByUserId(userId).stream()
            .map(DTOMapper::toCreditCardResultDTO)
            .toList();
    }

    @Transactional
    public CreditCard findOrCreateCreditCard(CreditCardRequestDTO creditCardDTO) {
        return creditCardRepository.findByCardNum(
            creditCardDTO.getCardNum()
        ).orElseGet(() -> {
            CreditCard newCard = new CreditCard();
            newCard.setCardNum(creditCardDTO.getCardNum());
            newCard.setCvv(creditCardDTO.getCvv());
            newCard.setExpiryTime(creditCardDTO.getExpiryTime());
            newCard.setHolderName(creditCardDTO.getHolderName());
            return creditCardRepository.save(newCard);
        });
    }

    @Transactional
    public void deleteCreditCard(CreditCard creditCard) {
        creditCardRepository.delete(creditCard);
    }
}
