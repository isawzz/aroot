SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) DEFAULT NULL,
  `username` varchar(25) DEFAULT NULL,
  `email` varchar(64) DEFAULT NULL,
  `password` varchar(25) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `image` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  KEY `username` (`username`),
  KEY `email` (`email`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT `users` (`id`,`userid`,`username`,`email`,`password`,`date`,`image`) VALUES 
(1,239152703,'felix','felix@yahoo.com','','2021-09-06 05:45:14','felix.jpg'), 
(2,897018908398,'amanda','amanda@yahoo.com','','2021-09-07 18:43:15','amanda.jpg'), 
(3,1148711,'lauren','lauren@yahoo.com','','2021-09-04 18:20:41','lauren.jpg'), 
(4,436347865711,'blade','blade@yahoo.com','password','2021-09-04 18:20:34','blade.jpg'), 
(5,759381114092987039,'mimi','mimi@email.com','','2021-09-04 20:56:58','mimi.jpg'), 
(6,15808188034829,'nimble','nimble@email.com','','2021-09-04 18:29:43','nimble.jpg'), 
(7,3438015244464810162,'meckele','meckele@email.com','','2021-09-04 18:30:02','meckele.jpg'), 
(8,64588075,'valerie','valerie@email.com','','2021-09-04 18:30:12','valerie.jpg'), 
(9,13842112628444,'ally','ally@email.com','','2021-09-04 18:30:21','ally.jpg'), 
(10,5972218382378318760,'leo','leo@email.com','','2021-09-04 18:31:18','leo.jpg'), 
(11,5972218382378318760,'bob','bob@email.com','','2021-09-04 18:31:18','bob.jpg'), 
(12,5972218382378318760,'max','max@email.com','','2021-09-04 18:31:18','max.jpg'), 
(13,9223372036854775807,'wolfgang','wolfgang@email.com','','2021-09-04 20:57:19','wolfgang.jpg'),
(14,9223372036854775807,'guest','guest@email.com','','2021-09-04 20:57:19','guest.jpg');

ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

