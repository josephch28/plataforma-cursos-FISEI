-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-11-2025 a las 11:33:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `plataforma_cursos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado`
--

CREATE TABLE `certificado` (
  `id_certificado` int(11) NOT NULL,
  `id_inscripcion` int(11) NOT NULL,
  `tipo` enum('asistencia','aprobacion') NOT NULL,
  `fecha_emision` date DEFAULT curdate(),
  `archivo_pdf` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso`
--

CREATE TABLE `curso` (
  `id_curso` int(11) NOT NULL,
  `cedula_admin` varchar(10) NOT NULL,
  `cedula_responsable` varchar(10) NOT NULL,
  `cedula_docente` varchar(10) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(60) DEFAULT NULL,
  `horas` int(11) DEFAULT NULL,
  `es_pagado` tinyint(1) DEFAULT 0,
  `costo` decimal(10,0) NOT NULL DEFAULT 0,
  `prerequisito` varchar(120) DEFAULT NULL,
  `publico_objetivo` varchar(120) DEFAULT NULL,
  `nota_aprobacion` decimal(4,2) DEFAULT 7.00,
  `requiere_asistencia` tinyint(1) DEFAULT 1,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `curso`
--

INSERT INTO `curso` (`id_curso`, `cedula_admin`, `cedula_responsable`, `cedula_docente`, `nombre`, `descripcion`, `tipo`, `horas`, `es_pagado`, `costo`, `prerequisito`, `publico_objetivo`, `nota_aprobacion`, `requiere_asistencia`, `fecha_inicio`, `fecha_fin`, `created_at`, `updated_at`, `activo`) VALUES
(10, '0101010101', '0202020202', '1850063809', 'Desarrollo Web', 'Curso introductorio de desarrollo web', 'Curso', 40, 1, 0, '', 'Público General', 8.00, 1, '2025-11-10', '2025-12-20', '2025-11-10 22:52:01', '2025-11-18 10:23:32', 1),
(11, '0101010101', '0202020202', '0202020202', 'Base de datos', 'oracle', 'Webinar', 10, 0, 0, '10', 'Personal UTA,Estudiantes UTA', 7.00, 1, '2025-11-18', '2025-12-19', '2025-11-18 05:04:22', '2025-11-18 10:23:23', 1),
(12, '0101010101', '0202020202', '1850063809', 'adjakdas', 'asddjhaskjdas', 'Curso', 10, 1, 30, NULL, 'Público General', 7.00, 1, '2025-11-18', '2025-11-30', '2025-11-18 09:23:19', '2025-11-18 10:23:10', 1),
(13, '0101010101', '0202020202', '1850063809', 'dasdas', 'asdasd', 'Curso', 10, 0, 0, NULL, 'Público General', 7.00, 1, '2025-11-20', '2025-12-06', '2025-11-18 10:08:44', '2025-11-18 10:23:03', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso_encargado`
--

CREATE TABLE `curso_encargado` (
  `id_curso` int(11) NOT NULL,
  `cedula_encargado` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `curso_encargado`
--

INSERT INTO `curso_encargado` (`id_curso`, `cedula_encargado`) VALUES
(1, '0303030303');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripcion`
--

CREATE TABLE `inscripcion` (
  `id_inscripcion` int(11) NOT NULL,
  `cedula_usuario` varchar(10) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `fecha` date DEFAULT curdate(),
  `estado` enum('pendiente','pagado','aprobado','reprobado') DEFAULT 'pendiente',
  `nota_final` decimal(5,2) DEFAULT NULL,
  `asistencia` decimal(5,2) DEFAULT NULL,
  `aprobado_por` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_inscripcion` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('transferencia','deposito','','') NOT NULL DEFAULT 'transferencia',
  `numero_orden` varchar(30) NOT NULL,
  `comprobante_pdf` varchar(255) DEFAULT NULL,
  `fecha_pago` date DEFAULT curdate(),
  `aprobado` tinyint(1) DEFAULT 0,
  `aprobado_por` varchar(30) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `id_inscripcion`, `monto`, `metodo_pago`, `numero_orden`, `comprobante_pdf`, `fecha_pago`, `aprobado`, `aprobado_por`, `fecha_aprobacion`, `created_at`, `updated_at`) VALUES
(1, 3, 20.00, 'transferencia', 'ORD-3-1763457301862', 'pago_3_1763457347731.pdf', '2025-11-18', 1, '0101010101', '2025-11-18 04:27:48', '2025-11-18 09:15:01', '2025-11-18 09:27:48'),
(2, 7, 30.00, 'transferencia', 'ORD-7-1763457935137', 'pago_7_1763457967934.pdf', '2025-11-18', 1, '0101010101', '2025-11-18 04:28:06', '2025-11-18 09:25:35', '2025-11-18 09:28:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_cambio`
--

CREATE TABLE `solicitudes_cambio` (
  `id` int(11) NOT NULL,
  `tipo_formulario` enum('usuario','experto') NOT NULL,
  `nombre_solicitante` varchar(80) NOT NULL,
  `apellido_solicitante` varchar(80) NOT NULL,
  `prioridad` varchar(20) NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `encargado1` varchar(120) NOT NULL,
  `encargado2` varchar(120) DEFAULT NULL,
  `encargado3` varchar(120) DEFAULT NULL,
  `encargado4` varchar(120) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `razon` text NOT NULL,
  `fecha_deseada` date DEFAULT NULL,
  `contacto` varchar(120) NOT NULL,
  `tipo_cambio` varchar(100) DEFAULT NULL,
  `impacto` varchar(20) DEFAULT NULL,
  `entorno_back` tinyint(1) NOT NULL DEFAULT 0,
  `entorno_front` tinyint(1) NOT NULL DEFAULT 0,
  `entorno_bd` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_guardado` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','realizado') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `cedula` varchar(10) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `rol` enum('admin','responsable','usuario','develop') DEFAULT 'usuario',
  `es_estudiante_uta` tinyint(1) NOT NULL DEFAULT 0,
  `es_personal_uta` tinyint(1) NOT NULL DEFAULT 0,
  `cedula_pdf` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `cedula`, `nombre`, `apellido`, `email`, `password`, `telefono`, `direccion`, `fecha_nacimiento`, `rol`, `es_estudiante_uta`, `es_personal_uta`, `cedula_pdf`, `created_at`, `updated_at`, `activo`) VALUES
(1, '0101010101', 'Damián', 'Chachaloooo', 'damian@uta.edu.ec', '$2b$10$HCsGIv/s1FS4PHdwqe1Yl.1wbgCCvGyvPehTBRKq59j4A7ubBgpN2', NULL, NULL, NULL, 'admin', 1, 1, NULL, '2025-11-10 22:52:01', '2025-11-18 06:25:30', 1),
(2, '0202020202', 'Boris', 'Jirón', 'boris@uta.edu.ex', '$2b$10$jgnKKFhPkYkuwUWEEj/2K.47dkJc556r.FWcZVKdMJG86Bc8ArzZ2', NULL, NULL, NULL, 'responsable', 0, 1, NULL, '2025-11-10 22:52:01', '2025-11-18 06:09:53', 1),
(3, '1850063809', 'Jonathan', 'Guevara', 'jm@gmail.com', '$2b$10$zdtymXG6GOpX5tYwvJgaUu6Y7IDdU4OBFY1QQc5/nTRhR0bp6BcAK', NULL, NULL, NULL, 'usuario', 0, 1, NULL, '2025-11-15 05:36:49', '2025-11-18 06:13:22', 1),
(4, '1234567890', 'asdasd', 'asdas', 'asdas@gmail.com', '$2b$10$qVsG1Shou6lXmC54EHSjDOb3NmzGJH4jNw0ymuZ/4SxRiYWgcnTI2', NULL, NULL, NULL, 'responsable', 1, 1, NULL, '2025-11-15 05:43:26', '2025-11-18 07:09:39', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD PRIMARY KEY (`id_certificado`),
  ADD KEY `id_inscripcion` (`id_inscripcion`);

--
-- Indices de la tabla `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`),
  ADD KEY `cedula_admin` (`cedula_admin`),
  ADD KEY `cedula_responsable` (`cedula_responsable`),
  ADD KEY `cedula_docente` (`cedula_docente`);

--
-- Indices de la tabla `curso_encargado`
--
ALTER TABLE `curso_encargado`
  ADD PRIMARY KEY (`id_curso`,`cedula_encargado`),
  ADD KEY `cedula_encargado` (`cedula_encargado`);

--
-- Indices de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  ADD PRIMARY KEY (`id_inscripcion`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`);

--
-- Indices de la tabla `solicitudes_cambio`
--
ALTER TABLE `solicitudes_cambio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`,`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `solicitudes_cambio`
--
ALTER TABLE `solicitudes_cambio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
