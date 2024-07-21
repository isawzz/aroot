drop table contrib;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `contrib` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(48) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due` bigint(20) DEFAULT NULL,
  `creator` varchar(24) DEFAULT NULL,
  `contributors` text DEFAULT NULL,
  `fen` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  `scoring` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `modified` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `contrib`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;