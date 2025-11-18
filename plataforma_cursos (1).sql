-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-11-2025 a las 07:39:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

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
  `cedula_docente` varchar(10) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(60) DEFAULT NULL,
  `horas` int(11) DEFAULT NULL,
  `es_pagado` tinyint(1) DEFAULT 0,
  `costo` decimal(10,2) DEFAULT 0.00,
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
(1, '0101010101', '0202020202', '1850063809', 'Desarrollo Web', 'Curso introductorio de desarrollo web', 'Tecnología', 40, 1, 120.00, '', '', 8.00, 1, '2025-11-10', '2025-12-20', '2025-11-10 22:52:01', '2025-11-11 17:35:01', 1);

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
  `metodo_pago` enum('transferencia','deposito') DEFAULT 'transferencia',
  `numero_orden` varchar(30) NOT NULL,
  `comprobante_pdf` varchar(255) DEFAULT NULL,
  `fecha_pago` date DEFAULT curdate(),
  `aprobado` tinyint(1) DEFAULT 0,
  `aprobado_por` varchar(10) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_cambio`
--

CREATE TABLE `solicitudes_cambio` (
  `id` int(11) NOT NULL,
  `tipo_formulario` enum('usuario','experto') NOT NULL,
  `nombre_solicitante` varchar(80) NOT NULL,
  `apellido_solicitante` varchar(80) NOT NULL,
  `prioridad` enum('baja','media','alta') NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `encargado1` varchar(120) NOT NULL,
  `encargado2` varchar(120) DEFAULT NULL,
  `encargado3` varchar(120) DEFAULT NULL,
  `encargado4` varchar(120) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `razon` text NOT NULL,
  `fecha_deseada` date DEFAULT NULL,
  `contacto` varchar(120) NOT NULL,
  `tipo_cambio` enum('rutinario','estandar','emergencia') DEFAULT NULL,
  `impacto` varchar(20) DEFAULT NULL,
  `entorno_back` tinyint(1) NOT NULL DEFAULT 0,
  `entorno_front` tinyint(1) NOT NULL DEFAULT 0,
  `entorno_bd` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_guardado` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','realizado') DEFAULT 'pendiente',
  `fecha_termino` date DEFAULT NULL
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
  `cedula_pdf` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `cedula`, `nombre`, `apellido`, `email`, `password`, `telefono`, `direccion`, `fecha_nacimiento`, `rol`, `cedula_pdf`, `created_at`, `updated_at`, `activo`) VALUES
(1, '0101010101', 'Damián', 'Chachalo', 'damian@uta.edu.ec', '12345', NULL, NULL, NULL, 'admin', NULL, '2025-11-10 22:52:01', '2025-11-15 05:35:42', 1),
(2, '0202020202', 'Boris', 'Jirón', 'boris@uta.edu.ex', '12345', NULL, NULL, NULL, 'responsable', NULL, '2025-11-10 22:52:01', '2025-11-15 05:41:19', 1),
(3, '1850063809', 'Jonathan', 'Guevara', 'jm@gmail.com', '12345678', NULL, NULL, NULL, 'usuario', NULL, '2025-11-15 05:36:49', '2025-11-15 05:42:58', 1),
(4, '1234567890', 'asdasd', 'asdas', 'asdas@gmail.com', 'sadddsad', NULL, NULL, NULL, 'usuario', NULL, '2025-11-15 05:43:26', '2025-11-15 05:43:26', 1),
(5, '3333333333', 'Carlos', 'Developer', 'carlos@uta.edu.ec', 'develop123', NULL, NULL, NULL, 'develop', NULL, '2025-11-16 06:03:47', '2025-11-16 06:03:47', 1);

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
  ADD KEY `cedula_responsable` (`cedula_responsable`);

--
-- Indices de la tabla `curso_encargado`
--
ALTER TABLE `curso_encargado`
  ADD PRIMARY KEY (`id_curso`,`cedula_encargado`),
  ADD KEY `cedula_encargado` (`cedula_encargado`);

--
-- Indices de la tabla `solicitudes_cambio`
--
ALTER TABLE `solicitudes_cambio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `solicitudes_cambio`
--
ALTER TABLE `solicitudes_cambio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
