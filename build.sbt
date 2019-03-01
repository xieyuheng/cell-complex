ThisBuild / version      := "0.1.0"
ThisBuild / scalaVersion := "2.12.7"
ThisBuild / organization := "cicada"

val scalatest = "org.scalatest" %% "scalatest" % "3.0.5"

lazy val cicada = (
  project in file ("cicada")
) .settings (
  name := "cicada",
  libraryDependencies += scalatest % "test",
)
