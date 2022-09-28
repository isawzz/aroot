drop table tables;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `tables` (
  `id` int(11) DEFAULT NULL,
	`friendly` varchar(50) DEFAULT NULL,
  `game` varchar(25) DEFAULT NULL,
  `host` varchar(30) DEFAULT NULL,
  `players` text DEFAULT NULL,
  `status` varchar(8) DEFAULT NULL,
  `akku` text DEFAULT NULL,
  `test` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  `pl_options` text DEFAULT NULL,
  `fen` text DEFAULT NULL,
  `end_scoring` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created` bigint(20) DEFAULT NULL,
  `modified` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `tables` (`id`,`friendly`, `game`, `created`, `modified`, `host`, `players`, `fen`, `options`, `status`) VALUES
(1, 'Battle of Liege', 'gSpotit', 1636336587652, 1636336587652, 'amanda', 'amanda,felix', 'noneed', '', 'started');

ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game` (`game`),
  ADD KEY `created` (`created`),
  ADD KEY `modified` (`modified`),
  ADD KEY `host` (`host`),
  ADD KEY `status` (`status`);

ALTER TABLE `tables`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;


