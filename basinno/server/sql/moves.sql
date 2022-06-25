SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `moves` (
  `id` bigint(20) NOT NULL,
  `game` varchar(25) DEFAULT NULL,
  `tid` varchar(50) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `user` varchar(30) DEFAULT NULL,
  `data` text DEFAULT NULL,
  `step` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `moves` (`id`, `game`, `tid`, `timestamp`, `user`, `data`, `step`) VALUES
(1, 'g', 'g_13214120', 13214120, 'felix', '1002', 1),
(2, 'g', 'g_13214121', 13214121, 'amanda', '1003', 1),
(3, 'g', 'g_13214122', 13214122, 'felix', '1021', 2),
(4, 'g', 'g_13214123', 13214123, 'amanda', '1322', 2);

ALTER TABLE `moves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game` (`game`),
  ADD KEY `tid` (`tid`),
  ADD KEY `timestamp` (`timestamp`),
  ADD KEY `user` (`user`),
  ADD KEY `step` (`step`);

ALTER TABLE `moves`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;


