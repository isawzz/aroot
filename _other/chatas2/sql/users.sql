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
(1,239152703,'felix','felix@yahoo.com','password','2021-09-06 05:45:14','felix.jpg'), 
(2,897018908398,'amanda','amanda@yahoo.com','password','2021-09-07 18:43:15','amanda.jpg'), 
(3,1148711,'lauren','lauren@yahoo.com','password','2021-09-04 18:20:41','lauren.jpg'), 
(4,436347865711,'baer','connor@yahoo.com','password','2021-09-04 18:20:34','baer.jpg'), 
(5,1615680372221,'maria','maria@email.com','','2021-09-05 17:16:46','maria.jpg'), 
(6,90057261623667,'aaron','aaron@email.com','','2021-09-04 18:28:23','aaron.jpg'), 
(7,759381114092987039,'mimi','mimi@email.com','','2021-09-04 20:56:58','mimi.jpg'), 
(8,4243507549226,'robert','robert@email.com','','2021-09-04 18:28:55','robert.jpg'), 
(9,43455547866,'john','john@email.com','','2021-09-04 18:29:11','john.jpg'), 
(10,15808188034829,'nimble','nimble@email.com','','2021-09-04 18:29:43','nimble.jpg'), 
(11,3438015244464810162,'maurita','maurita@email.com','','2021-09-04 18:30:02','maurita.jpg'), 
(12,64588075,'luis','luis@email.com','','2021-09-04 18:30:12','luis.jpg'), 
(13,13842112628444,'hanna','hanna@email.com','','2021-09-04 18:30:21','hanna.jpg'), 
(14,5972218382378318760,'leo','leo@email.com','','2021-09-04 18:31:18','leo.jpg'), 
(15,9223372036854775807,'bob','bob@email.com','','2021-09-04 20:57:19','bob.jpg');

ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

