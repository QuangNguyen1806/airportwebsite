from flask import Blueprint, request, jsonify
import utility
from database import getdb
import json
from flask_jwt_extended import get_jwt_identity, jwt_required

airport_api = Blueprint("airport_api", __name__)


@airport_api.route("/", methods=["PUT"])
@jwt_required(locations="cookies")
def add_airport():
    body = utility.convertBody(
        json.loads(request.data.decode("UTF-8")),
        {
            "airport_code": "code",
            "name": "name",
            "city": "city",
            "country": "country",
            "airport_type": "airport_type",
        },
    )

    if body == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "staff":
        return {"msg": "Staff Only"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        try:
            cursor.execute(
                """
                    INSERT INTO airport
                        VALUES ( %(airport_code)s, %(name)s,
                                %(city)s, %(country)s, %(airport_type)s)
                """,
                body,
            )
        except:
            cursor.close()
            return {"msg": "invalid field"}, 409

        mydb.commit()
        cursor.close()

    return {"msg": "success"}
