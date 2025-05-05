from flask import Blueprint, request, jsonify
import utility
from database import getdb
import json

from flask_jwt_extended import get_jwt_identity, jwt_required

comments_api = Blueprint("comments_api", __name__)


@comments_api.route("/", methods=["GET"])
@jwt_required(locations="cookies")
def get_comments():
    try:
        params = utility.convertParams(
            request.args,
            {
                "airline_name": "airline_name",
                "flight_number": "flight_number",
                "departure_date_time": "departure_date_time",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "Missing Field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "staff":
        return {"msg": "Staff Only"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != params["airline_name"]:
            return {"msg": "airline staff is not authorized to get other airline's information "}, 403

        if (
            utility.getFlight(cursor, params["airline_name"], params["flight_number"], params["departure_date_time"])
            == None
        ):
            return {"msg": "Flight Not Found"}, 404

        cursor.execute(
            """
            SELECT email, comment, rating
                FROM rate
                WHERE airline_name = %(airline_name)s 
                    AND flight_number = %(flight_number)s 
                    AND departure_date_time = %(departure_date_time)s
            """,
            params,
        )

        result = cursor.fetchall()
        cursor.close()

        response = {"comments": []}
        for items in result:
            response["comments"].append({"author": items[0], "comment": items[1], "rating": items[2]})

    return response


@comments_api.route("/", methods=["PUT"])
@jwt_required(locations="cookies")
def make_comments():
    try:
        body = utility.convertBody(
            json.loads(request.data.decode("UTF-8")),
            {
                "email": "email",
                "airline_name": "airline_name",
                "flight_number": "flight_number",
                "departure_date_time": "departure_date_time",
                "rating": "rating",
                "comment": "comment",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if body == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "customer":
        return {"msg": "Customer Only"}, 403

    if identity["username"] != body["email"]:
        return {"msg": "email not match"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        if utility.getFlight(cursor, body["airline_name"], body["flight_number"], body["departure_date_time"]) == None:
            return {"msg": "Flight Not Found"}, 404

        try:
            cursor.execute(
                """
                    INSERT INTO rate
                        VALUES (%(email)s, %(airline_name)s, %(flight_number)s,
                                %(departure_date_time)s, %(rating)s, %(comment)s)
                """,
                body,
            )
        except:
            cursor.close()
            return {"msg": "invalid field"}, 409

        mydb.commit()
        cursor.close()

    return {"msg": "success"}
