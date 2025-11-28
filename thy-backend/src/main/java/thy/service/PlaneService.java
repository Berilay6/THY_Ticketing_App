package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.PlaneRepository;

@Service
@RequiredArgsConstructor
public class PlaneService {
    
    public final PlaneRepository planeRepository;
}
