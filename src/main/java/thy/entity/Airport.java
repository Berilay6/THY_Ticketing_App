package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Airport") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Airport {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "airport_id")
	private Long airportId;
	
	@Column(name = "iata_code", nullable = false, length = 3, unique = true)
	private String iataCode;
	
	@Column(name = "name", nullable = false, length = 100)
	private String name;
	
	@Column(name = "city", nullable = false, length = 100)
	private String city;
	
	@Column(name = "country", nullable = false, length = 100)
	private String country;
	
	@Column(name = "timezone", nullable = false, length = 50)
	private String timezone;
}
