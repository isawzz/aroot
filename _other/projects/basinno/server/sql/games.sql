-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 25, 2020 at 07:45 PM
-- Server version: 10.1.30-MariaDB
-- PHP Version: 7.2.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mychat_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `messages`
-- sender,receiver,message,date,msgid

CREATE TABLE `gametables` (
  `id` bigint(20) NOT NULL,
  `msgid` bigint(20) DEFAULT NULL,
  `sender` varchar(50) DEFAULT NULL,
  `chatid` bigint(20) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `text` varchar(300) DEFAULT NULL,
  `content` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `messages` (`id`, `msgid`, `chatid`, `sender`, `date`, `text`, `content`) VALUES
(1, 239152703, 13214125, 'felix', '2020-12-25 15:31:32', 'hello, all, aristocracy?',null),
(2, 5246246703, 13214125, 'amanda', '2020-12-25 15:35:32', 'yeah, cool!',null),
(3, 23923403, 13214125, 'lauren', '2020-12-25 15:37:32', 'joining in...',null),
(4, 52352703, 13214125, 'felix', '2020-12-25 15:45:32', 'great, starting!',null);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `msgid` (`msgid`),
  ADD KEY `chatid` (`chatid`),
  ADD KEY `sender` (`sender`),
  ADD KEY `date` (`date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
