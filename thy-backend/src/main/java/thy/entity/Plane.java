package thy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Plane") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Plane {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "plane_id")
	private Long planeId;
	
	@Column(name ="model_type", nullable = false, length = 100)
	private String modelType;
	
	public enum PlaneStatus {
		active,
		maintenance,
		retired
	}
	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private PlaneStatus status = PlaneStatus.active;
	
	@ManyToOne
	@JoinColumn(name = "airport_id")
	private Airport airport;
}
