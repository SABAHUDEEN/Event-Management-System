-- ============================================================
-- The Food Bros Event Management System - MySQL schema
-- Converted from the original PHP project's phpMyAdmin dump.
-- Table/column names and relationships are kept exactly the
-- same as the original so the data model concept is unchanged.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `event_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `event_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Table: permissions  (role -> capability flags)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `permission` VARCHAR(255) NOT NULL,
  `createuser` VARCHAR(255) DEFAULT NULL,
  `deleteuser` VARCHAR(255) DEFAULT NULL,
  `createbid` VARCHAR(255) DEFAULT NULL,
  `updatebid` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `permissions` (`id`, `permission`, `createuser`, `deleteuser`, `createbid`, `updatebid`) VALUES
(1, 'Superuser', '1', '1', '1', '1'),
(2, 'Admin', '1', NULL, '1', '1'),
(3, 'User', NULL, NULL, '1', NULL);

-- ------------------------------------------------------------
-- Table: tbladmin  (admin / staff users who log in)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tbladmin`;
CREATE TABLE `tbladmin` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `Staffid` VARCHAR(255) DEFAULT NULL,
  `AdminName` VARCHAR(120) DEFAULT NULL COMMENT 'role name e.g. Admin / User',
  `UserName` VARCHAR(120) DEFAULT NULL,
  `FirstName` VARCHAR(255) DEFAULT NULL,
  `LastName` VARCHAR(255) DEFAULT NULL,
  `MobileNumber` BIGINT(10) DEFAULT NULL,
  `Email` VARCHAR(200) DEFAULT NULL,
  `Status` INT(11) NOT NULL DEFAULT 1,
  `Photo` VARCHAR(255) NOT NULL DEFAULT 'avatar15.jpg',
  `Password` VARCHAR(255) DEFAULT NULL COMMENT 'bcrypt hash',
  `AdminRegdate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default login -> username: admin / password: admin123
-- (hash generated with bcrypt, see database/seed.js if you want to regenerate)
INSERT INTO `tbladmin` (`ID`, `Staffid`, `AdminName`, `UserName`, `FirstName`, `LastName`, `MobileNumber`, `Email`, `Status`, `Photo`, `Password`, `AdminRegdate`) VALUES
(1, 'U001', 'Admin', 'admin', 'Royal', 'Admin', 9423979339, 'admin@royalevents.com', 1, 'avatar15.jpg', '$2a$10$UVOSr1m1BPSXjWyx8n.i8e5CCWc7vhuoksQ5BUAM75u1vpmgZmkUu', NOW());

-- ------------------------------------------------------------
-- Table: tblbooking  (customer booking requests)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tblbooking`;
CREATE TABLE `tblbooking` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `BookingID` INT(10) DEFAULT NULL,
  `ServiceID` VARCHAR(200) DEFAULT NULL COMMENT 'comma-separated tblservice.ID list, e.g. 1,3,4',
  `Name` VARCHAR(200) DEFAULT NULL,
  `MobileNumber` BIGINT(10) DEFAULT NULL,
  `Email` VARCHAR(200) DEFAULT NULL,
  `EventDate` VARCHAR(200) DEFAULT NULL,
  `EventStartingtime` VARCHAR(200) DEFAULT NULL,
  `EventEndingtime` VARCHAR(200) DEFAULT NULL,
  `VenueAddress` MEDIUMTEXT,
  `EventType` VARCHAR(200) DEFAULT NULL,
  `AdditionalInformation` MEDIUMTEXT,
  `BookingDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `Remark` VARCHAR(200) DEFAULT NULL,
  `Status` VARCHAR(200) DEFAULT NULL COMMENT 'NULL = pending, Approved, Cancelled',
  `UpdationDate` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `ServiceID` (`ServiceID`(100)),
  KEY `EventType` (`EventType`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tblbooking` (`ID`, `BookingID`, `ServiceID`, `Name`, `MobileNumber`, `Email`, `EventDate`, `EventStartingtime`, `EventEndingtime`, `VenueAddress`, `EventType`, `AdditionalInformation`, `BookingDate`, `Remark`, `Status`, `UpdationDate`) VALUES
(1, 954554731, 1, 'Surabhi Kumawat', 8080808080, 'surabhi@gmail.com', '2026-08-22', '11 a.m', '12 p.m', 'Suyojeet Tower, near Relience Petrol Pump, Kinaara Hotel, Nashik', 'Birthday Party', 'Special Menu with Professional waiters', NOW(), 'Done', 'Approved', NOW()),
(2, 977361722, 1, 'Jayesh Panghawane', 7070707070, 'jayesh768@gmail.com', '2026-08-24', '1 p.m', '5 p.m', 'Bansi Plaza, near Kumar Hotel, Nashik', 'Wedding', 'Special Menu', NOW(), NULL, NULL, NULL);

-- ------------------------------------------------------------
-- Table: tblcompany  (single-row company profile)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tblcompany`;
CREATE TABLE `tblcompany` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(255) DEFAULT NULL,
  `companyname` VARCHAR(255) DEFAULT NULL,
  `companyemail` VARCHAR(255) DEFAULT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `companyphone` TEXT NOT NULL,
  `companyaddress` VARCHAR(255) NOT NULL,
  `companylogo` VARCHAR(255) NOT NULL DEFAULT 'logo.png',
  `status` VARCHAR(255) NOT NULL DEFAULT '1',
  `creationdate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tblcompany` (`id`, `regno`, `companyname`, `companyemail`, `country`, `companyphone`, `companyaddress`, `companylogo`, `status`, `creationdate`) VALUES
(1, '43422332', 'The Food Bros Event', 'dummy@thefoodbrosevent.com', 'India', '+919423979339', 'Kothrud, Pune', 'logo.png', '1', NOW());

-- ------------------------------------------------------------
-- Table: tbleventtype  (event categories)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tbleventtype`;
CREATE TABLE `tbleventtype` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `EventType` VARCHAR(200) DEFAULT NULL,
  `CreationDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `EventType` (`EventType`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tbleventtype` (`ID`, `EventType`, `CreationDate`) VALUES
(1, 'Anniversary', NOW()),
(2, 'Birthday Party', NOW()),
(3, 'Charity', NOW()),
(4, 'Cocktail', NOW()),
(5, 'College', NOW()),
(6, 'Community', NOW()),
(7, 'Concert', NOW()),
(8, 'Engagement', NOW()),
(9, 'Get Together', NOW()),
(10, 'Government', NOW()),
(11, 'Night Club', NOW()),
(12, 'Post Wedding', NOW()),
(13, 'Pre Engagement', NOW()),
(14, 'Religious', NOW()),
(15, 'Sangeet', NOW()),
(16, 'Social', NOW()),
(17, 'Wedding', NOW());

-- ------------------------------------------------------------
-- Table: tblservice  (services offered)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tblservice`;
CREATE TABLE `tblservice` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `ServiceName` VARCHAR(200) DEFAULT NULL,
  `SerDes` VARCHAR(250) NOT NULL,
  `ServicePrice` VARCHAR(200) DEFAULT NULL,
  `CreationDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tblservice` (`ID`, `ServiceName`, `SerDes`, `ServicePrice`, `CreationDate`) VALUES
(1, 'Party decorations', 'We finish designing 4 hours before your ceremony.', '8000', NOW()),
(2, 'Party DJ', 'We install the DJ equipment 1 hour before your selected event start time.', '700', NOW()),
(3, 'Ceremony Music', 'Our ceremony music service is a popular add-on to our wedding DJ all-day hire.', '650', NOW()),
(4, 'Photo Booth Hire', 'We install the photo booth before your ceremony.', '500', NOW()),
(5, 'Uplighters', 'Uplighters are bright lighting fixtures installed on the floor that shine a vibrant wash of colour over the walls of your venue.', '200', NOW());

-- ------------------------------------------------------------
-- Table: tblbilling  (bills raised against a booking)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tblbilling`;
CREATE TABLE `tblbilling` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `BillNo` VARCHAR(50) NOT NULL,
  `BookingID` INT(10) NOT NULL COMMENT 'FK to tblbooking.ID',
  `Amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'base amount before tax/discount',
  `TaxPercent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `Discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `TotalAmount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount + tax - discount',
  `PaymentStatus` VARCHAR(20) NOT NULL DEFAULT 'Unpaid' COMMENT 'Unpaid, Paid, Partially Paid',
  `PaymentMode` VARCHAR(50) DEFAULT NULL COMMENT 'Cash, Card, UPI, Bank Transfer',
  `Notes` VARCHAR(255) DEFAULT NULL,
  `BillDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdationDate` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `BookingID` (`BookingID`),
  CONSTRAINT `fk_billing_booking` FOREIGN KEY (`BookingID`) REFERENCES `tblbooking` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
