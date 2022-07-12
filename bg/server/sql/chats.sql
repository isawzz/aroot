
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `chats` (
  `id` bigint(20) NOT NULL,
  `chatid` bigint(20) DEFAULT NULL,
  `type` varchar(8) DEFAULT NULL,
  `tableid` bigint(20) DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `chats` (`id`, `chatid`, `type`, `tableid`, `date`) VALUES
(1, 13214125, 'lobby', null, '2020-12-25 15:31:32'),
(2, 13214125, 'game', 2424, '2020-12-25 15:31:32');

ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chatid` (`chatid`),
  ADD KEY `type` (`type`),
  ADD KEY `tableid` (`tableid`),
  ADD KEY `date` (`date`);

ALTER TABLE `chats`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

