SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `messages` (
 `id` bigint(20) NOT NULL,
 `sender` varchar(25) NOT NULL,
 `receiver` varchar(25) NOT NULL,
 `message` text NOT NULL,
 `files` varchar(200) NOT NULL,
 `date` datetime NOT NULL,
 `seen` tinyint(4) NOT NULL,
 `received` tinyint(4) NOT NULL,
 `deleted_sender` tinyint(4) NOT NULL,
 `deleted_receiver` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `messages` (`id`, `sender`, `receiver`, `message`, `files`, `date`, `seen`, `received`, `deleted_sender`,`deleted_receiver`) VALUES
(1, 'felix', 'amanda', 'he spielma', '', '2020-12-25 15:31:32', 1,1,0,0),
(2, 'amanda', 'felix', 'ok', '', '2020-12-25 15:34:32', 1,1,0,0),
(3, 'felix', 'amanda', 'los gehts mit inno', '', '2020-12-25 15:38:32', 1,1,0,0),
(4, 'amanda', 'felix', 'ready!', '', '2020-12-25 15:51:32', 1,1,0,0);

ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender` (`sender`),
  ADD KEY `receiver` (`receiver`),
  ADD KEY `date` (`date`);

ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

