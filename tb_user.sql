/*
 Navicat Premium Data Transfer

 Source Server         : Xian_Web
 Source Server Type    : MySQL
 Source Server Version : 80027
 Source Host           : 66.42.111.49:3306
 Source Schema         : level_upgrade

 Target Server Type    : MySQL
 Target Server Version : 80027
 File Encoding         : 65001

 Date: 03/11/2021 16:04:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_user
-- ----------------------------
DROP TABLE IF EXISTS `tb_user`;
CREATE TABLE `tb_user`  (
  `user_id` int(0) NOT NULL AUTO_INCREMENT,
  `user_rid` int(0) NOT NULL DEFAULT 2000,
  `user_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_level` int(0) NOT NULL DEFAULT 0,
  `user_register_date` int(0) NOT NULL DEFAULT 1635733707,
  `user_role` int(0) NOT NULL DEFAULT 0,
  `user_state` int(0) NOT NULL DEFAULT 0,
  `user_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `user_is_verified` int(0) NOT NULL DEFAULT 0,
  `user_expires` int(0) NOT NULL DEFAULT 1635734307,
  `user_wallet_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `user_verify_code` int(0) NOT NULL DEFAULT 0,
  `user_invited_from` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `user_superior_id` int(0) NOT NULL DEFAULT 0,
  `user_del` int(0) NOT NULL DEFAULT 0,
  `user_allow_update` int(0) NOT NULL DEFAULT 1,
  `user_allow_login` int(0) NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_user
-- ----------------------------
INSERT INTO `tb_user` VALUES (1, 2001, 'talentlucky0816@gmail.com', '6a204bd89f3c8348afd5c77c717a097a', 4, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VyX2VtYWlsIjoidGFsZW50bHVja3kwODE2QGdtYWlsLmNvbSIsImlhdCI6MTYzNTkyMTgzNiwiZXhwIjoxNjM1OTcyMjM2fQ.kSmbpPPdsYPi_IjU12aI5qctkcQga-02CrzTVVb93wA', 1, 1638380869, 'TUN4dKBLbAZjArUS7zYewHwCYA6GSUeSaK', 651352, '', 0, 0, 1, 1);
INSERT INTO `tb_user` VALUES (2, 2002, 'A@user.com', '6a204bd89f3c8348afd5c77c717a097a', 3, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VyX2VtYWlsIjoiQUB1c2VyLmNvbSIsImlhdCI6MTYzNTg5NTY1MCwiZXhwIjoxNjM1OTQ2MDUwfQ.Sw6CuT6zweDNcm4JwQb_uZOypR65AQOVzKOrwu-v_uo', 1, 1636055046, 'TGGccx77cPodHs1Jruq2wD2GR59WXyXpCD', 185200, 'talentlucky0816@gmail.com', 0, 0, 1, 1);
INSERT INTO `tb_user` VALUES (3, 2003, 'B@user.com', '6a204bd89f3c8348afd5c77c717a097a', 0, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VyX2VtYWlsIjoiQkB1c2VyLmNvbSIsImlhdCI6MTYzNTg5NTE2NSwiZXhwIjoxNjM1OTQ1NTY1fQ.4VOYfMxU0bOfEuKat4CChUe_LMENnQrg1FuB78a-6Wo', 1, 1638410935, 'TVAeaPjdJYGgirydKx6rTgBpx6C3geLjjp', 605086, 'A@.user.com', 0, 0, 1, 1);
INSERT INTO `tb_user` VALUES (4, 2004, 'C@user.com', '6a204bd89f3c8348afd5c77c717a097a', 0, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJ1c2VyX2VtYWlsIjoiQ0B1c2VyLmNvbSIsImlhdCI6MTYzNTgyMjYwNiwiZXhwIjoxNjM1ODczMDA2fQ.pQfhGhGc22_3kiy-qZl6d4W9ZbzxXofpx6ju1a7TPJo', 1, 1638412764, 'TY4fknjjsRGx3u6Pn8r34qFxUAWfJGK7Py', 972506, '', 0, 0, 1, 1);
INSERT INTO `tb_user` VALUES (5, 0, 'D@user.com', '6a204bd89f3c8348afd5c77c717a097a', 0, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJ1c2VyX2VtYWlsIjoiREB1c2VyLmNvbSIsImlhdCI6MTYzNTg5NTY0OCwiZXhwIjoxNjM1OTQ2MDQ4fQ.egtbsCJ88AW-T5ElSmKqFfjX-p87oj9wrKtw8fXLRq4', 1, 1638487595, 'ASDF', 353213, '', 0, 0, 1, 1);
INSERT INTO `tb_user` VALUES (6, 2000, 'test@test.com', '6a204bd89f3c8348afd5c77c717a097a', 0, 1635733707, 0, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJ1c2VyX2VtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYzNTkxODU3NywiZXhwIjoxNjM1OTY4OTc3fQ.widlaOtMue6xCRgnQWss-9o7hIO8KPHrfX33oPQaa2Y', 1, 1638507661, 'asdf', 177254, '', 0, 0, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
