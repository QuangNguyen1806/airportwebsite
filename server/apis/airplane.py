from flask import Blueprint, request, jsonify
import utility
from database import getdb
import json
from flask_jwt_extended import get_jwt_identity, jwt_required

airplane_api = Blueprint("airplane_api", __name__)


@airplane_api.route("/", methods=["PUT"])
@jwt_required(locations="cookies")
def create_airplanes():
    try:
        body = utility.convertBody(
            json.loads(request.data.decode("UTF-8")),
            {
                "airline_name": "airline_name",
                "seat_number": "seat_number",
                "manufacturing_company": "manufacturing_company",
                "manufacturing_date": "manufacturing_date",
                "age": "age",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if body == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "staff":
        return {"msg": "Staff Only"}, 403

    try:
        if int(body["seat_number"]) <= 0:
            return {"msg": "seat number must be positive"}, 422
    except:
        return {"msg": "invalid field"}

    with getdb() as mydb:
        cursor = mydb.cursor()

        if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != body["airline_name"]:
            return {"msg": "airline staff is not authorized to get other airline's information "}, 403

        try:
            cursor.execute(
                """
                    INSERT INTO airplane(airline_name, seat_number,manufacturing_company,manufacturing_date,age)
                        VALUES ( %(airline_name)s, %(seat_number)s,
                                %(manufacturing_company)s, %(manufacturing_date)s, %(age)s
                                )
                """,
                body,
            )
        except:
            cursor.close()
            return {"msg": "invalid field"}, 409

        mydb.commit()
        cursor.close()

    return {"msg": "success"}
