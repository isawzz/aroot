drop table expenses;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `expenses` (
  `id` int(11) DEFAULT NULL,
 	`amount` int(11) NOT NULL,
	`currency` varchar(8) DEFAULT NULL,
	`type` varchar(8) DEFAULT NULL,
  `cat` varchar(25) DEFAULT NULL,
  `group` varchar(25) DEFAULT NULL,
  `date` bigint(20) DEFAULT NULL,
  `location` varchar(30) DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `currency` (`currency`),
  ADD KEY `type` (`type`),
  ADD KEY `cat` (`cat`),
  ADD KEY `group` (`group`),
  ADD KEY `date` (`date`),
  ADD KEY `location` (`location`);

ALTER TABLE `expenses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;


