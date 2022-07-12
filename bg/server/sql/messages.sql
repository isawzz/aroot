CREATE TABLE `messages` (
 `id` bigint(11) NOT NULL AUTO_INCREMENT,
 `sender` varchar(25) NOT NULL,
 `receiver` varchar(25) NOT NULL,
 `message` text NOT NULL,
 `files` varchar(200) NOT NULL,
 `date` datetime NOT NULL,
 `seen` int(11) NOT NULL,
 `received` int(11) NOT NULL,
 `deleted_sender` tinyint(4) NOT NULL,
 `deleted_receiver` tinyint(4) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `id` (`id`),
 KEY `sender` (`sender`),
 KEY `receiver` (`receiver`),
 KEY `date` (`date`),
 KEY `seen` (`seen`),
 KEY `deleted_sender` (`deleted_sender`),
 KEY `deleted_receiver` (`deleted_receiver`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT `messages` (`id`,`userid`,`username`,`email`,`password`,`date`,`image`) VALUES 
(1,239152703,'felix','felix@yahoo.com','password','2021-09-06 05:45:14','felix.jpg');
