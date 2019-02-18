package com.azavea.mamlvalidator

import cats.effect._
import cats.implicits._
import org.http4s.HttpRoutes
import org.http4s.server.Router
import org.http4s.server.blaze.BlazeServerBuilder
import org.http4s.syntax.kleisli._

object MamlValidatorServer extends IOApp {
  def run(args: List[String]): IO[ExitCode] =
    ServerStream.stream[IO].compile.drain.as(ExitCode.Success)
}

object ServerStream {
  def mamlValidatorRoutes[F[_]: Effect]: HttpRoutes[F] =
    new MamlValidatorRoutes[F].routes

  def stream[F[_]: ConcurrentEffect: Timer]: fs2.Stream[F, ExitCode] =
    BlazeServerBuilder[F]
      .bindHttp(8801, "0.0.0.0")
      .withHttpApp(
        Router(
          "/" -> mamlValidatorRoutes
        ).orNotFound)
      .serve
}
