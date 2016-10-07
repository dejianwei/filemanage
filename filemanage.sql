-- MySQL dump 10.13  Distrib 5.6.31, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: filemanage
-- ------------------------------------------------------
-- Server version	5.6.31-0ubuntu0.15.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `borrow`
--

DROP TABLE IF EXISTS `borrow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow` (
  `user_id` int(11) NOT NULL,
  `file_id` varchar(45) NOT NULL,
  PRIMARY KEY (`user_id`,`file_id`),
  KEY `file_id` (`file_id`),
  CONSTRAINT `borrow_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `borrow_ibfk_2` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow`
--

LOCK TABLES `borrow` WRITE;
/*!40000 ALTER TABLE `borrow` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `category` varchar(45) NOT NULL,
  `page` int(11) NOT NULL DEFAULT '1',
  `documentnum` int(11) NOT NULL DEFAULT '1',
  `borrowed` tinyint(1) NOT NULL DEFAULT '0',
  `responsibleperson` varchar(45) NOT NULL,
  `savetime` date NOT NULL,
  `filetime` date NOT NULL,
  `saveperiod` varchar(45) NOT NULL DEFAULT 'forever' COMMENT 'forever, short time, long time',
  `confidentialitype` varchar(45) NOT NULL DEFAULT 'inner' COMMENT 'open, inner, secret, top secret',
  `path` varchar(45) NOT NULL,
  `isdirectory` tinyint(1) NOT NULL DEFAULT '0',
  `isstored` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `indexname` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES ('/test/','test/','folder',1,1,0,'admin','2016-09-27','2016-09-27','forever','inner','/',1,1),('/test/dev/','dev/','folder',1,1,0,'admin','2016-09-27','2016-09-27','forever','inner','/test/',1,1),('/test/dev/qwe/','qwe/','folder',1,1,0,'admin','2016-09-27','2016-09-27','forever','inner','/test/dev/',1,1),('1','计划表.xlsx','jihua',1,1,0,'wei','2016-09-26','2016-09-20','forever','inner','/',0,1),('2','第八周.xlsx','jihua',1,1,0,'user','2016-09-27','2016-09-20','forever','inner','/',0,1),('5','第十一周 .xlsx','jihua',1,1,0,'wei','2016-09-27','2016-09-20','forever','inner','/test/',0,1),('6','第十二周.xlsx','jihua',1,1,0,'wei','2016-09-27','2016-09-20','forever','inner','/test/dev/',0,1),('8','工作表.xlsx','jihua',1,1,0,'wei','2016-09-27','2016-09-20','forever','inner','/',0,0);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('RS_ggVWRHm9eHgr7tCzd2W3P9-XbaRUg',1475062503,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":6,\"name\":\"wei\",\"password\":\"b59ec7959c463206c1e18b7883b50d54\",\"email\":\"sduwdj@outlook.com\",\"role\":\"admin\"}}'),('SqUpX3QHg0vbkyDcxUwyrguXXksEPc0L',1475124670,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":null}'),('W-vEHfwYnjcSbO2ysHzTWOhPoH4IrVWD',1475124553,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":6,\"name\":\"wei\",\"password\":\"b59ec7959c463206c1e18b7883b50d54\",\"email\":\"sduwdj@outlook.com\",\"role\":\"admin\"}}'),('Yko5F3-j34kn_akNuOnCHdYApXAOPxhC',1475060570,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":null}'),('zgsu6nte-Uj5MOocwy3ecO85wB3g768l',1475062467,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":6,\"name\":\"wei\",\"password\":\"b59ec7959c463206c1e18b7883b50d54\",\"email\":\"sduwdj@outlook.com\",\"role\":\"admin\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `role` varchar(45) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'wei','b59ec7959c463206c1e18b7883b50d54','sduwdj@outlook.com','admin'),(10,'user','827ccb0eea8a706c4c34a16891f84e7b','295808954@qq.com','user'),(11,'lulu','827ccb0eea8a706c4c34a16891f84e7b','17865195520@163.com','manager');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-10-07 13:48:30
