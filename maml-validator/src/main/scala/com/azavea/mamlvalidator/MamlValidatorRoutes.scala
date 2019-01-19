package com.azavea.mamlvalidator

import cats.effect.Sync
import cats.implicits._
import io.circe.Json
import io.circe.parser.decode
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl
import com.azavea.maml.ast._
import com.azavea.maml.ast.codec.tree._

class MamlValidatorRoutes[F[_]: Sync]
    extends Http4sDsl[F]
    with ExpressionTreeCodec {
  implicit val mamlDecoder = jsonOf[F, Expression]

  val routes: HttpRoutes[F] =
    HttpRoutes.of[F] {
      case GET -> Root / "health" =>
        Ok()
      case req @ POST -> Root / "validate" =>
        for {
          expression <- req.as[Json]
          resp <- expression.as[Expression] match {
            case Right(_) => Ok()
            case Left(e)  => BadRequest(e.getMessage)
          }
        } yield (resp)
    }
}
