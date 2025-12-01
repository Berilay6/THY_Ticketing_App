use THY;

DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS FlightSeat;
DROP TABLE IF EXISTS Seat;
DROP TABLE IF EXISTS Flight;
DROP TABLE IF EXISTS Plane;
DROP TABLE IF EXISTS Airport;
DROP TABLE IF EXISTS CreditCard;
DROP TABLE IF EXISTS `User`;

-- 1) USER
CREATE TABLE `User` (
    user_id       BIGINT UNSIGNED AUTO_INCREMENT,
    first_name    VARCHAR(50)  NOT NULL,
    middle_name   VARCHAR(50)  NULL,
    last_name     VARCHAR(50)  NOT NULL,
    date_of_birth DATE         NOT NULL,
    gender        ENUM('F','M','O') NOT NULL,
    nationality   VARCHAR(50)  NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password      CHAR(8) NOT NULL,
    phone_num     VARCHAR(15)  NOT NULL UNIQUE,
    user_type     ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    mile          INT NOT NULL DEFAULT 0,
    
    CONSTRAINT phone_domain CHECK (phone_num REGEXP '^\\+?[0-9]{10,15}$'),
    CONSTRAINT email_domain CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    PRIMARY KEY (user_id)
) ;


-- 2) AIRPORT
CREATE TABLE Airport (
    airport_id BIGINT UNSIGNED AUTO_INCREMENT,
    iata_code  CHAR(3)        NOT NULL UNIQUE,
    name       VARCHAR(100)   NOT NULL,
    city       VARCHAR(100)   NOT NULL,
    country    VARCHAR(100)   NOT NULL,
    timezone   VARCHAR(50)    NOT NULL,
    
    PRIMARY KEY (airport_id),
    CONSTRAINT timezone_domain CHECK (timezone REGEXP "^UTC([+-](0[0-9]|1[0-4])(:[0-5][0-9])?)?$")
);


-- 3) PLANE
-- Plane – Airport : N–1  
CREATE TABLE Plane (
    plane_id   BIGINT UNSIGNED AUTO_INCREMENT,
    model_type VARCHAR(100) NOT NULL,
    status     ENUM('active','maintenance','retired') NOT NULL DEFAULT 'active',
    airport_id BIGINT UNSIGNED NULL,
    
    PRIMARY KEY (plane_id),
    CONSTRAINT plane_airport
        FOREIGN KEY (airport_id)
        REFERENCES Airport(airport_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- 4) FLIGHT
-- Flight – Plane : N–1
-- origin_airport_id, destination_airport_id -> Airport
CREATE TABLE Flight (
    flight_id              BIGINT UNSIGNED AUTO_INCREMENT,
    origin_airport_id      BIGINT UNSIGNED NOT NULL,
    destination_airport_id BIGINT UNSIGNED NOT NULL,
    departure_time         TIMESTAMP       NOT NULL,
    arrival_time           TIMESTAMP       NOT NULL,
    flight_duration_min    INT UNSIGNED NULL,
    plane_id               BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (flight_id),
    CONSTRAINT flight_origin_airport
        FOREIGN KEY (origin_airport_id)
        REFERENCES Airport(airport_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
        
    CONSTRAINT flight_dest_airport
        FOREIGN KEY (destination_airport_id)
        REFERENCES Airport(airport_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
        
    CONSTRAINT flight_plane
        FOREIGN KEY (plane_id)
        REFERENCES Plane(plane_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- 5) SEAT
-- Plane – Seat : 1–N
-- (plane_id, seat_number) composite key
CREATE TABLE Seat (
    plane_id    BIGINT UNSIGNED NOT NULL,
    seat_number VARCHAR(3)      NOT NULL,
    type        ENUM('economy','premium_economy','business','first') NOT NULL,
    status      ENUM('active','broken','unavailable') NOT NULL DEFAULT 'active',
    
    PRIMARY KEY (plane_id, seat_number),
    CONSTRAINT seat_domain CHECK (seat_number REGEXP '^[1-9][0-9]{0,1}[A-Z]$'),
    CONSTRAINT seat_plane
        FOREIGN KEY (plane_id)
        REFERENCES Plane(plane_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- 6) FLIGHTSEAT
-- FlightSeat: belirli bir uçuşta belirli numaralı koltuğun durumu
-- Flight – FlightSeat : 1–N
-- PK: (flight_id, seat_number)
CREATE TABLE FlightSeat (
    flight_id   BIGINT UNSIGNED NOT NULL,
    seat_number VARCHAR(3)      NOT NULL,
    availability ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
    price				   DECIMAL(10,2)  NOT NULL,
    
    PRIMARY KEY (flight_id, seat_number),
    CONSTRAINT flightseat_domain CHECK (seat_number REGEXP '^[1-9][0-9]{0,1}[A-Z]$'),
    CONSTRAINT flightseat_flight
        FOREIGN KEY (flight_id)
        REFERENCES Flight(flight_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 7) PAYMENT
-- Payment – User   : N–1
CREATE TABLE Payment (
    payment_id   BIGINT UNSIGNED AUTO_INCREMENT,
    user_id      BIGINT UNSIGNED NOT NULL,
    method       ENUM('card','mile','cash') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       ENUM('pending','paid','refunded','failed') 
                NOT NULL DEFAULT 'pending',
    paid_at      TIMESTAMP      NULL,
    
    PRIMARY KEY (payment_id),
    CONSTRAINT payment_user
        FOREIGN KEY (user_id)
        REFERENCES `User`(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);


-- 8) TICKET
-- Ticket – FlightSeat : 1–1
-- Payment – Ticket : 1–N
CREATE TABLE Ticket (
    ticket_id          BIGINT UNSIGNED AUTO_INCREMENT,
    payment_id    	   BIGINT UNSIGNED NOT NULL,
    issue_time         TIMESTAMP     NOT NULL,
    flight_id          BIGINT UNSIGNED NOT NULL,
    seat_number        VARCHAR(3)   NOT NULL,
    status             ENUM('booked','cancelled','checked_in','completed') 
                      NOT NULL DEFAULT 'booked',
    has_extra_baggage  BOOLEAN      NOT NULL DEFAULT 0,
    has_meal_service   BOOLEAN      NOT NULL DEFAULT 0,
    
    PRIMARY KEY (ticket_id),
    -- FlightSeat ile birebir ilişki:
    CONSTRAINT ticket_flightseat
        FOREIGN KEY (flight_id, seat_number)
        REFERENCES FlightSeat(flight_id, seat_number)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
	
    CONSTRAINT payment_ticket
        FOREIGN KEY (payment_id)
        REFERENCES Payment(payment_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
        
    UNIQUE (flight_id, seat_number)
);

-- User - CreaditCard : 1:N
-- 9) CREDIT CARD
CREATE TABLE CreditCard(
	user_id     BIGINT UNSIGNED  NOT NULL,
    card_num    CHAR(16)  NOT NULL,
    CVV  CHAR(3) NOT NULL,
    expiry_time  CHAR(5) NOT NULL,
    holder_name  VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (user_id, card_num),
    CONSTRAINT user_card 
		FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
        
	CONSTRAINT card_number_domain CHECK (card_number REGEXP '^[0-9]{16}$'),
    CONSTRAINT cvv_domain CHECK (cvv REGEXP '^[0-9]{3}$'),
    CONSTRAINT expr_domain CHECK (expiry_time REGEXP '^(0[1-9]|1[0-2])/[0-9]{2}$')
);
