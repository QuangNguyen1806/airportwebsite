-- 1. Create airline table
CREATE TABLE airline (
    name VARCHAR(50) PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create airline_staff tables
CREATE TABLE airline_staff (
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    airline_name VARCHAR(50) NOT NULL,
    CONSTRAINT fk_staff_airline
      FOREIGN KEY (airline_name)
      REFERENCES airline(name)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE airline_staff_phone_number (
    username VARCHAR(100),
    phone_number VARCHAR(20),
    PRIMARY KEY (username, phone_number),
    CONSTRAINT fk_staff_phone
      FOREIGN KEY (username)
      REFERENCES airline_staff(username)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE airline_staff_email_address (
    username VARCHAR(100),
    email_address VARCHAR(30),
    PRIMARY KEY (username, email_address),
    CONSTRAINT fk_staff_email
      FOREIGN KEY (username)
      REFERENCES airline_staff(username)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create airplane table with AUTO_INCREMENT and composite unique key
CREATE TABLE airplane (
    ID INT NOT NULL AUTO_INCREMENT,
    airline_name VARCHAR(50) NOT NULL,
    seat_number INT NOT NULL,
    manufacturing_company VARCHAR(100),
    manufacturing_date DATE,
    age INT,
    PRIMARY KEY (ID),
    UNIQUE KEY uk_airline_plane (airline_name, ID),
    CONSTRAINT fk_airplane_airline
      FOREIGN KEY (airline_name)
      REFERENCES airline(name)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create airport table
CREATE TABLE airport (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    airport_type VARCHAR(20) NOT NULL,
    CHECK (airport_type IN ('domestic','international','both'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create flight table referencing airplane and airport
CREATE TABLE flight (
    airline_name VARCHAR(50),
    flight_number INT,
    departure_date_time DATETIME,
    departure_airport_code VARCHAR(10) NOT NULL,
    arrival_date_time DATETIME NOT NULL,
    arrival_airport_code VARCHAR(10) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    airplane_ID INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (airline_name, flight_number, departure_date_time),
    CONSTRAINT fk_flight_departure_airport
      FOREIGN KEY (departure_airport_code)
      REFERENCES airport(code)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CONSTRAINT fk_flight_arrival_airport
      FOREIGN KEY (arrival_airport_code)
      REFERENCES airport(code)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CONSTRAINT fk_flight_airplane
      FOREIGN KEY (airline_name, airplane_ID)
      REFERENCES airplane(airline_name, ID)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CHECK (status IN ('scheduled','ontime','delayed','departed','arrived'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Create customer tables
CREATE TABLE customer (
    email VARCHAR(30) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    building_number INT NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    apartment_number VARCHAR(20),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    zip_code VARCHAR(20),
    passport_number VARCHAR(20) NOT NULL,
    passport_expiration DATE NOT NULL,
    passport_country VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_phone_number (
    email VARCHAR(30),
    phone_number VARCHAR(20),
    PRIMARY KEY (email, phone_number),
    CONSTRAINT fk_customer_phone
      FOREIGN KEY (email)
      REFERENCES customer(email)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Create ticket table referencing flight, airline, and customer
CREATE TABLE ticket (
    ID INT NOT NULL AUTO_INCREMENT,
    airline_name VARCHAR(50) NOT NULL,
    flight_number INT NOT NULL,
    departure_date_time DATETIME NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    calculated_price DECIMAL(10,2) NOT NULL,
    email VARCHAR(30) NOT NULL,
    purchased_date_time DATETIME NOT NULL,
    card_type VARCHAR(10) NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    card_name VARCHAR(200) NOT NULL,
    expiration_date DATE NOT NULL,
    PRIMARY KEY (ID),
    CONSTRAINT fk_ticket_flight
      FOREIGN KEY (airline_name, flight_number, departure_date_time)
      REFERENCES flight(airline_name, flight_number, departure_date_time)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CONSTRAINT fk_ticket_airline
      FOREIGN KEY (airline_name)
      REFERENCES airline(name)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CONSTRAINT fk_ticket_customer
      FOREIGN KEY (email)
      REFERENCES customer(email)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CHECK (card_type IN ('credit','debit'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Create rate table referencing flight and customer
CREATE TABLE rate (
    email VARCHAR(30),
    airline_name VARCHAR(50),
    flight_number INT,
    departure_date_time DATETIME,
    rating INT NOT NULL,
    comment VARCHAR(10000),
    PRIMARY KEY (email, airline_name, flight_number, departure_date_time),
    CONSTRAINT fk_rate_flight
      FOREIGN KEY (airline_name, flight_number, departure_date_time)
      REFERENCES flight(airline_name, flight_number, departure_date_time)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CONSTRAINT fk_rate_customer
      FOREIGN KEY (email)
      REFERENCES customer(email)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$

CREATE TRIGGER airplane_auto_id
BEFORE INSERT ON airplane
FOR EACH ROW
BEGIN
  SET NEW.ID = (
      SELECT IFNULL(MAX(ID), 0) + 1
      FROM airplane
      WHERE airline_name = NEW.airline_name
  );
END$$

DELIMITER ;